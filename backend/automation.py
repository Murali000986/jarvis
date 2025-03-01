# Import required libraries
from AppOpener import close, open as appopen
from webbrowser import open as webopen
from pywhatkit import search, playonyt
from dotenv import dotenv_values
from bs4 import BeautifulSoup
from rich import print
from groq import Groq
import webbrowser
import subprocess
import requests
import keyboard
import asyncio
import os

# Load environment variables
env_vars = dotenv_values(".env")
GroqAPIkey = env_vars.get("GroqAPIKey")

# Debugging: Check if API key is loaded correctly
print(f"Loaded GroqAPIKey: {GroqAPIkey}", flush=True)

if not GroqAPIkey:
    raise ValueError("GroqAPIKey is not set. Check your .env file or the script's path.")

# Initialize the Groq client with the API key
try:
    client = Groq(api_key=GroqAPIkey)
    print("Groq client initialized successfully.", flush=True)
except Exception as e:
    print(f"Error initializing Groq client: {e}", flush=True)
    exit(1)

# Predefined classes for web scraping
classes = [
    "zCubwf", "hgKElc", "LTK00 SY7ric", "Z0LcW", "gsrt vk_bk FzvWSb YwPhnf", "pclqee",
    "tw-Data-text tw-text-small tw-ta", "IZ6rdc", "05uR6d LTK00", "vlzY6d",
    "webanswers-webanswers_table_webanswers-table", "dDoNo ikb4Bb gsrt", "sXLa0e",
    "LWkfKe", "VQF4g", "qv3Wpe", "kno-rdesc", "SPZz6b"
]

# Define a user-agent for making web requests
useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36'

# Predefined professional responses
professional_responses = [
    "Your satisfaction is my top priority; feel free to reach out if there's anything else I can help you with.",
    "I'm at your service for any additional questions or support you may need—don't hesitate to ask."
]

# List to store chatbot messages
messages = []

# System message to provide context to the chatbot
SystemChatBot = [{"role": "system", "content": "Hello, I am a content writer. You have to write content like letters, emails, etc."}]

# Function to perform Google search
def GoogleSearch(Topic):
    search(Topic)
    return True

# Function to create content based on the user topic
def Content(Topic):
    Topic = Topic.replace("content", "")
    ContentByAI = ContentWriterAI(Topic)
    file_path = rf"Data\{Topic.lower().replace(' ', '_')}.txt"
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(ContentByAI)
    OpenNotepad(file_path)
    return True

# Function to open Notepad with the generated content file
def OpenNotepad(File):
    default_text_editor = 'notepad.exe'
    subprocess.Popen([default_text_editor, File])

# Function to generate content using the Groq API
def ContentWriterAI(prompt):
    messages.append({"role": "user", "content": prompt})
    try:
        completion = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=SystemChatBot + messages,
            max_tokens=2048,
            temperature=0.7,
            top_p=1,
            stream=True,
            stop=None
        )
    except Exception as e:
        print(f"Error during API call: {e}", flush=True)
        return "Error in processing the request."

    Answer = ""
    for chunk in completion:
        if "delta" in chunk.choices[0]:
            Answer += chunk.choices[0].delta.content
    Answer = Answer.replace("</s>", "")
    messages.append({"role": "assistant", "content": Answer})
    return Answer

# Function to search for a topic on YouTube
def YoutubeSearch(Topic):
    Url4Search = f"https://www.youtube.com/results?search_query={Topic}"
    webbrowser.open(Url4Search)
    return True

# Function to play a video on YouTube
def PlayYoutube(query):
    playonyt(query)
    return True

# Function to open an application
def OpenApp(app, sess=requests.session()):
    try:
        appopen(app, match_closest=True, output=True, throw_error=True)
        return True
    except Exception as e:
        print(f"Error opening app: {e}", flush=True)

        def extract_links(html):
            if html is None:
                return []
            soup = BeautifulSoup(html, 'html.parser')
            links = soup.find_all('a', {'jsname': 'UWcKNb'})
            return [link.get('href') for link in links]

        def search_google(query):
            url = f"https://www.google.com/search?q={query}"
            response = sess.get(url, headers={"User-Agent": useragent})
            if response.status_code == 200:
                return response.text
            else:
                print("Failed to retrieve search result.", flush=True)
                return None

        html = search_google(app)
        if html:
            links = extract_links(html)
            if links:
                webopen(links[0])
            else:
                print(f"No links found for {app}", flush=True)
        return True

# Function to close an application
def CloseApp(app):
    try:
        close(app, match_closest=True, output=True, throw_error=True)
        return True
    except Exception as e:
        print(f"Error closing app: {e}", flush=True)
        return False

# Function to handle system volume control
def System(command):
    def mute():
        keyboard.press_and_release("Volume mute")

    def unmute():
        keyboard.press_and_release("Volume unmute")

    def volume_up():
        keyboard.press_and_release("Volume up")

    def volume_down():
        keyboard.press_and_release("Volume down")

    if command == "mute":
        mute()
    elif command == "unmute":
        unmute()
    elif command == "volume up":
        volume_up()
    elif command == "volume down":
        volume_down()

    return True

# Asynchronously execute a list of commands
async def TranslateAndExecute(commands: list[str]):
    funcs = []
    for command in commands:
        if command.startswith("open"):
            fun = asyncio.to_thread(OpenApp, command.removeprefix("open "))
            funcs.append(fun)
        elif command.startswith("close"):
            fun = asyncio.to_thread(CloseApp, command.removeprefix("close "))
            funcs.append(fun)
        elif command.startswith("play"):
            fun = asyncio.to_thread(PlayYoutube, command.removeprefix("play "))
            funcs.append(fun)
        elif command.startswith("content"):
            fun = asyncio.to_thread(Content, command.removeprefix("content "))
            funcs.append(fun)
        elif command.startswith("google search"):
            fun = asyncio.to_thread(GoogleSearch, command.removeprefix("google search "))
            funcs.append(fun)
        elif command.startswith("youtube search"):
            fun = asyncio.to_thread(YoutubeSearch, command.removeprefix("youtube search "))
            funcs.append(fun)
        elif command.startswith("system"):
            fun = asyncio.to_thread(System, command.removeprefix("system "))
            funcs.append(fun)
        else:
            print(f"No function found for {command}", flush=True)

    results = await asyncio.gather(*funcs)
    for result in results:
        if isinstance(result, str):
            yield result
        else:
            yield result

# Main function to automate execution based on commands
async def Automation(commands: list[str]):
    async for result in TranslateAndExecute(commands):
        pass
    return True

if __name__ == "__main__":
    asyncio.run(Automation([
        "open facebook", "open google", "open whatsapp", 
        "open youtube", "open instagram", "content for me song"
    ]))
