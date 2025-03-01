from groq import Groq
from json import load, dump
import datetime
from dotenv import dotenv_values

# Load environment variables
env_vars = dotenv_values(".env")

# Retrieve variables from .env file
cohereAPI = env_vars.get("cohereAPI")
Username = env_vars.get("Username")
Assistantname = env_vars.get("Assistantname")
InputLanguage = env_vars.get("InputLanguage")
AssistantVoice = env_vars.get("AssistantVoice")
GroqAPIKey = env_vars.get("GroqAPIKey")

# Verify API Key is loaded
if not GroqAPIKey:
    raise ValueError("Missing GROQ_API_KEY in .env file!")

# Instantiate Groq client
client = Groq(api_key=GroqAPIKey)

messages = []

# System message and preamble
System = f"""Hello, I am {Username}, You are a very accurate and advanced AI chatbot named {Assistantname} which also has real-time up-to-date information from the internet.
*** Do not tell time until I ask, do not talk too much, just answer the question.***
*** Reply in only English, even if the question is in Hindi, reply in English.***
*** Do not provide notes in the output, just answer the question and never mention your training data. ***
"""

SystemChatBot = [{"role": "system", "content": System}]

# Try to load the chat log, create if not found
try:
    with open(r"Data\ChatLog.json", "r") as f:
        messages = load(f)
except FileNotFoundError:
    with open(r"Data\ChatLog.json", "w") as f:
        dump([], f)

# Function to fetch real-time information
def RealtimeInformation():
    current_data_time = datetime.datetime.now()
    day = current_data_time.strftime("%A")
    date = current_data_time.strftime("%d")
    month = current_data_time.strftime("%B")
    year = current_data_time.strftime("%Y")
    hour = current_data_time.strftime("%H")
    minute = current_data_time.strftime("%M")
    second = current_data_time.strftime("%S")

    data = f"Please use this real-time information if needed,\n"
    data += f"Day: {day}\nDate: {date}\nMonth: {month}\nYear: {year}\n"
    data += f"Time: {hour} hours {minute} minutes {second} seconds\n"
    return data

# Function to modify the answer
def AnswerModifier(Answer):
    line = Answer.split('\n')
    non_empty_lines = [line for line in line if line.strip()]
    return non_empty_lines

# Main chatbot function
def Chatbot(query):
    """This function sends the user's query to the chatbot and returns the AI's response."""
    
    # Load previous messages
    try:
        with open(r"Data\ChatLog.json", "r") as f:
            messages = load(f)

        # Append user message to chat history
        messages.append({"role": "user", "content": f"{query}"})

        # Fetch real-time information
        real_time_info = RealtimeInformation()

        # Call Groq API for response
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=SystemChatBot + [{"role": "system", "content": real_time_info}] + messages,
            max_tokens=1024,
            temperature=0.7,
            top_p=1,
            stream=True,
            stop=None
        )

        Answer = ""

        # Process the streamed response
        for chunk in completion:
            if hasattr(chunk, 'choices') and chunk.choices:
                choice = chunk.choices[0]
                if hasattr(choice, 'delta') and hasattr(choice.delta, 'content') and choice.delta.content:
                    Answer += choice.delta.content

        # Clean the answer
        Answer = Answer.replace("</s>", "").strip()

        # Append AI's answer to the messages
        messages.append({"role": "assistant", "content": Answer})

        # Save the updated chat log
        with open(r"Data\ChatLog.json", "w") as f:
            dump(messages, f, indent=4)

        return Answer
    
    except Exception as e:
        return f"Error: {e}"

# Main loop to take input from the user
if __name__ == "__main__":
    while True:
        user_input = input("Enter your question: ")
        response = Chatbot(user_input)
        print(response)
