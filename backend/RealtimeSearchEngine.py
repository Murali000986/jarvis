from googlesearch import search
from groq import Groq
from json import load, dump
import os
import datetime
from dotenv import dotenv_values

# Load environment variables
env_vars = dotenv_values(".env")

Username = env_vars.get("Username", "User")
Assistantname = env_vars.get("Assistantname", "Assistant")
GroqAPIKey = env_vars.get("GroqAPIKey")

if not GroqAPIKey:
    raise ValueError("GroqAPIkey is missing in the .env file.")

client = Groq(api_key=GroqAPIKey)

System = f"""Hello, I am {Username}, You are a very accurate and advanced AI chatbot named {Assistantname} which has real-time up-to-date information from the internet.
*** Provide Answers In a Professional Way, make sure to add full stops, commas, question marks, and use proper grammar.***
*** Just answer the question from the provided data in a professional way. ***"""

# Ensure the Data directory exists
if not os.path.exists("Data"):
    os.makedirs("Data")

# Load or initialize chat logs
try:
    with open(r"Data\ChatLog.json", "r") as f:
        messages = load(f)
except FileNotFoundError:
    with open(r"Data\ChatLog.json", "w") as f:
        dump([], f)
    messages = []


def GoogleSearch(query):
    try:
        result = search(query, num_results=5)
        Answer = f"The search results for '{query}' are:\n[start]\n"
        for i in result:
            Answer += f"{i}\n"
        Answer += "[end]"
        return Answer
    except Exception as e:
        return f"Error during Google Search: {e}"


def AnswerModifier(Answer):
    lines = Answer.split('\n')
    non_empty_lines = [line for line in lines if line.strip()]
    modified_answer = '\n'.join(non_empty_lines)
    return modified_answer


def Information():
    data = ""
    current_data_time = datetime.datetime.now()
    day = current_data_time.strftime("%A")
    date = current_data_time.strftime("%d")
    month = current_data_time.strftime("%B")
    year = current_data_time.strftime("%Y")
    hour = current_data_time.strftime("%H")
    minute = current_data_time.strftime("%M")
    second = current_data_time.strftime("%S")
    data += "Use this real-time information if needed:\n"
    data += f"Day: {day}\n"
    data += f"Date: {date}\n"
    data += f"Month: {month}\n"
    data += f"Year: {year}\n"
    data += f"Time: {hour} hours, {minute} minutes, {second} seconds.\n"
    return data


def RealtimeSearchEngine(prompt):
    global messages

    # Load chat log
    with open(r"Data\ChatLog.json", "r") as f:
        messages = load(f)
    messages.append({"role": "user", "content": f"{prompt}"})

    # System chat setup
    SystemChatBot = [
        {"role": "system", "content": System},
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello, how can I help you?"},
    ]

    SystemChatBot.append({"role": "system", "content": GoogleSearch(prompt)})

    # Completion request
    completion = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=SystemChatBot + [{"role": "system", "content": Information()}] + messages,
        max_tokens=1024,
        temperature=0.7,
        top_p=1,
        stream=False,
        stop=None,
    )

    # Access content properly
    try:
        Answer = completion.choices[0].message.content
    except AttributeError as e:
        print("Error accessing response content:", e)
        print("Completion object:", completion)
        return "An error occurred while processing your query."

    # Append to chat log
    messages.append({"role": "assistant", "content": Answer})

    # Save chat log
    with open(r"Data\ChatLog.json", "w") as f:
        dump(messages, f, indent=4)

    return AnswerModifier(Answer=Answer)


if __name__ == "__main__":
    while True:
        prompt = input("Enter your query: ")
        print(RealtimeSearchEngine(prompt))
