import cohere
from rich import print
from dotenv import dotenv_values

# Load environment variables
env_vars = dotenv_values(".env")

# Correctly retrieve the Cohere API key
CohereAPIkey = env_vars.get("cohereAPI")

# Instantiate the Cohere client with the API key
co = cohere.Client(api_key=CohereAPIkey)

# List of functions that the bot will handle
funcs = [
    "exit", "general", "realtime", "open", "close", "play",
    "generate image", "system", "content", "google search",
    "youtube search", "reminder"
]

messages = []

preamble = """
You are a very accurate Decision-Making Model, which decides what kind of query is given to you.
You will decide whether a query is a 'general' query, a 'realtime' query, or is asking to perform any task or automation like 'open facebook, instagram', 'can you write an application and open it in notepad'.
*** Do not answer any query, just decide what kind of query is given to you. ***

-> Respond with 'general (query)' if a query can be answered by an LLM model (conversational AI chatbot) and doesn't require any up-to-date information.
    Examples:
    - "who was akbar?" → 'general who was akbar?'
    - "how can I study more effectively?" → 'general how can I study more effectively?'
    - "can you help me with this math problem?" → 'general can you help me with this math problem?'
    - "Thanks, I really liked it." → 'general thanks, I really liked it.'
    - "what is python programming language?" → 'general what is python programming language?'
    - "What is machine learning?" → 'general What is machine learning?'
    - "Who invented the telephone?" → 'general Who invented the telephone?'
    - "Can you tell me about the solar system?" → 'general Can you tell me about the solar system?'
    - "What is the capital of France?" → 'general What is the capital of France?'
    - "How does the internet work?" → 'general How does the internet work?'
    - "What is the meaning of life?" → 'general What is the meaning of life?'
    - "What is the largest planet in our solar system?" → 'general What is the largest planet in our solar system?'

-> Respond with 'realtime (query)' if a query requires real-time information or up-to-date data such as current events, weather, or time-sensitive events.
    Examples:
    - "what is the weather today?" → 'realtime what is the weather today?'
    - "who won the last cricket match?" → 'realtime who won the last cricket match?'
    - "what is the stock price of Apple?" → 'realtime what is the stock price of Apple?'
    - "tell me the latest news on climate change" → 'realtime tell me the latest news on climate change'
    - "What time is it now?" → 'realtime What time is it now?'
    - "What is the news today?" → 'realtime What is the news today?'
    - "How much is Bitcoin worth today?" → 'realtime How much is Bitcoin worth today?'

-> Respond with 'task (query)' if a query asks the model to perform a task or automation (like opening applications, creating files, etc.).
    Examples:
    - "open facebook" → 'task open facebook'
    - "open instagram" → 'task open instagram'
    - "can you write a simple application and open it in notepad?" → 'task can you write a simple application and open it in notepad'
    - "remind me to call John at 3 PM" → 'task remind me to call John at 3 PM'
    - "open youtube and play a song" → 'task open youtube and play a song'
    - "Can you open Microsoft Word?" → 'task Can you open Microsoft Word?'

-> Respond with 'open (application name or website name)' if the query requests opening an application or website.
    Examples:
    - "open chrome" → 'open chrome'
    - "open google" → 'open google'
    - "open facebook" → 'open facebook'
    - "open instagram" → 'open instagram'

-> Respond with 'close (application name)' if the query requests closing an application.
    Examples:
    - "close chrome" → 'close chrome'
    - "close youtube" → 'close youtube'

-> Respond with 'play (song name)' if the query asks to play a song.
    Examples:
    - "play my favorite song" → 'play my favorite song'
    - "play the latest hit song" → 'play the latest hit song'

-> Respond with 'generate image' if the query asks to generate an image.
    Examples:
    - "generate image of a sunset" → 'generate image of a sunset'
    - "generate an image of a cat" → 'generate an image of a cat'

-> Respond with 'system' if the query is related to system-related tasks or information.
    Examples:
    - "show me system information" → 'system show me system information'
    - "check disk usage" → 'system check disk usage'

-> Respond with 'content (topic)' if the query is asking about content on a specific topic.
    Examples:
    - "content about AI" → 'content about AI'
    - "content on machine learning" → 'content on machine learning'

-> Respond with 'google (topic)' if the query asks to search something on Google.
    Examples:
    - "google python programming" → 'google python programming'
    - "google latest news" → 'google latest news'

-> Respond with 'youtube search (topic)' if the query asks to search something on YouTube.
    Examples:
    - "youtube search python tutorial" → 'youtube search python tutorial'
    - "youtube search machine learning video" → 'youtube search machine learning video'

-> Respond with 'exit' if the user asks to exit or says goodbye.
    Examples:
    - "bye" → 'exit'
    - "goodbye" → 'exit'
    - "exit" → 'exit'
    - "see you later" → 'exit'
    - "take care" → 'exit'
    - "quit" → 'exit'
    - "stop" → 'exit'
    - "end" → 'exit'
    - "that's all" → 'exit'
    - "I'm done" → 'exit'
    

-> Do not answer the query, just classify it as one of the above categories.
"""

# Chat history to simulate conversation
ChatHistory = [
    {"role": "user", "message": "how are you?"},
    {"role": "Chatbot", "message": "general how are you?"},
    {"role": "user", "message": "do you like pizza?"},
    {"role": "Chatbot", "message": "general do you like pizza."},
    {"role": "user", "message": "open chrome and tell me about Mahatma Gandhi."},
    {"role": "Chatbot", "message": "open chrome general tell me about Mahatma Gandhi."},
    {"role": "user", "message": "open chrome and firefox"},
    {"role": "Chatbot", "message": "open chrome, open firefox."},
    {"role": "user", "message": "what is today's date and remind me that I have a dancing performance on 5th Aug at 11pm"},
    {"role": "Chatbot", "message": "general what is today's date, reminder 11:00pm 5th Aug dancing performance"},
    {"role": "user", "message": "chat with me."},
    {"role": "Chatbot", "message": "general chat with me."}
]


# Define the first layer DMM function
def FirstlayerDMM(prompt: str):
    messages.append({"role": "user", "content": f"{prompt}"})

    # Stream the response from Cohere's API
    stream = co.chat_stream(
        model='command-r-plus',
        message=prompt,
        temperature=0.7,
        chat_history=ChatHistory,
        prompt_truncation='OFF',  
        connectors=[],
        preamble=preamble
    )

    response = ""
    # Capture the streamed response
    for even in stream:
        if even.event_type == "text-generation":
            response += even.text

    # Clean and split the response
    response = response.replace("\n", "")
    response = response.split(",")
    response = [i.strip() for i in response]

    temp = []

    # Filter response based on predefined tasks
    for task in response:
        for func in funcs:
            if task.startswith(func):
                temp.append(task)

    response = temp

    # If the query contains "(query)", process further
    if "(query)" in response:
        # Recursively call FirstlayerDMM
        newresponse = FirstlayerDMM(prompt=prompt)
        return newresponse
    else:
        return response


# Main loop to take input from the user
if __name__ == "__main__":
    while True:
        user_input = input(">>> ")
        if user_input.lower() in ["bye", "goodbye", "exit", "quit", "stop", "end", "that's all", "i'm done"]:
            print("Goodbye! Have a great day!")
            break
        response = FirstlayerDMM(user_input)
        print(response)