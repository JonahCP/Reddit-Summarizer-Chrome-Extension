import praw
import os
import re
from openai import OpenAI
import fastapi
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

client_id = os.getenv('CLIENT_ID')
client_secret = os.getenv('CLIENT_SECRET')
user_agent = os.getenv('USER_AGENT')

app = fastapi.FastAPI()

# Add CORS middleware to handle OPTIONS requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow requests from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods, including POST
    allow_headers=["*"],  # Allow all headers
)

def contains_media(comment_body):
    # Regex to match media file extensions
    media_regex = r"(https?://\S+\.(jpg|png|gif|jpeg))|(https?://(www\.)?(imgur|giphy)\.com/\S+)"
    return re.search(media_regex, comment_body) is not None

def is_deleted_or_removed(comment_body):
    return comment_body in ["[deleted]", "[removed]"]

def fetch_comments(submission_url, limit=10):
    # Create a Reddit instance
    reddit = praw.Reddit(
        client_id=client_id,
        client_secret=client_secret,
        user_agent=user_agent,
        check_for_async=False
    )

    reddit.read_only = True

    submission = reddit.submission(url=submission_url)
    submission.comment_sort = 'top'
    submission.comments.replace_more(limit=1)

    comments = []

    # Skip submissions that contain media or are deleted/removed
    if (contains_media(submission.selftext) or is_deleted_or_removed(submission.selftext)):
        return None
    
    # Grab submission title
    comments.append(f"Submission Title: {submission.title}")
    comments.append("\n")

    # Fetch the top 10 comments and their top 3 replies
    for top_level_comment in submission.comments[:limit]:
        # Skip comments that contain media or are deleted/removed
        if top_level_comment.score > 0 and not (contains_media(top_level_comment.body) or is_deleted_or_removed(top_level_comment.body)):
            comments.append(f"Comment Score: {top_level_comment.score}")
            comments.append(f"Comment Body: {top_level_comment.body}")

        for i, reply in enumerate(top_level_comment.replies[:3], 1):
            if reply.score > 0 and not (contains_media(reply.body) or is_deleted_or_removed(reply.body)):
                comments.append(f"\tReply {i} Score: {reply.score}")
                comments.append(f"\tReply {i} Body: {reply.body}")

    return comments

def create_prompt(formatted_comments):
    formatted_comments = "\n".join(formatted_comments)
    prompt = f"Give me a paragraph summary of the overall sentiment and from these Reddit replies, taking into account the score (likes) for each comment as an indicator of a more popular opinion. Remember, do not summarize individual comments, give a summary of all the comments and the overall consensus: \n\n{formatted_comments}"
    return prompt

def get_sentiment(prompt):
    # Set up OpenAI API
    client = OpenAI(api_key=os.getenv('SECRET_KEY'))

    response = client.chat.completions.create(
        model="gpt-4o-mini-2024-07-18",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that analyzes Reddit replies and provides a one paragraph summary of their sentiment. You're first given the title of the post, then the replies. Consider the number of likes/upvotes as an indicator of importance and popularity of an opinion. "},
            {"role": "user", "content": prompt},
        ]
    )
    return response.choices[0].message.content

@app.post("/summarize")
async def summarize(request: Request):
    data = await request.json()
    submission_url = data["url"]
    comments = fetch_comments(submission_url)
    prompt = create_prompt(comments)
    sentiment = get_sentiment(prompt)

    return {"sentiment": sentiment}    

handler = Mangum(app) # Wrap the FastAPI app with Mangum