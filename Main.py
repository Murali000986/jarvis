from dotenv import dotenv_values  # Added import for dotenv_values
from frountend.GUI import (
    GraphicalUserInterface,
    SetAssistantStatus,
    ShowTextToScreen,
    TempDirectoryPath,
    SetMicrophoneStatus,
    AnswerModifier,
    QueryModifier,
    GetMicrophoneStatus,
    GetAssistantStatus
)
from backend.model import FirstlayerDMM
from backend.RealtimeSearchEngine import RealtimeSearchEngine
from backend.automation import Automation
from backend.speechtotext import SpeechRecognition
from backend.chatbot import Chatbot
from backend.TextToSpeech import TextToSpeech
from asyncio import run
from time import sleep
import subprocess
import threading
import json
import os
import pyttsx3  # Ensure this library is installed for text-to-speech

# Load environment variables
env_vars = dotenv_values(".env")
Username = env_vars.get("Username")
Assistantname = env_vars.get("Assistantname")
DefaultMessage = f''''{Username} : Hello {Assistantname},How are you?
{Assistantname} : welcome {Username}. I am doing well. How may I help you?'''
subprocess = []
Functions = ["open", "close", "play", "system", "content", "google search", "youtube search"]

def ShowDefultChatIfNoChats():
    File = open(r'Data\ChatLog.json', "r", encoding='utf-8')
    
    if len(File.read()) < 5:
        with open(TempDirectoryPath('Database.data'), "w", encoding='utf-8') as file:
            file.write("")  # Clear the database file
        
        with open(TempDirectoryPath('Responses.data'), "w", encoding='utf-8') as file:
            file.write(DefaultMessage)  # Write the default chat message

def ReadChatLogJson():
    with open(r'Data\ChatLog.json', 'r', encoding='utf-8') as file:
        chatlog_data = json.load(file)
    return chatlog_data  # Add return statement

def ChatLogIntegration():
    json_data = ReadChatLogJson()
    formatted_chatlog = ""
    for entry in json_data:
        if entry["role"] == "user":
            formatted_chatlog += f"User: {entry['content']}\n"  # Corrected typo: "USer" to "User"
        elif entry["role"] == "assistant":
            formatted_chatlog += f"Assistant: {entry['content']}\n"
    formatted_chatlog = formatted_chatlog.replace("User", Username + "")
    formatted_chatlog = formatted_chatlog.replace("Assistant", Assistantname + "")

    with open(TempDirectoryPath('Database.data'), 'w', encoding='utf-8') as file:
        file.write(AnswerModifier(formatted_chatlog))

def ShowCatsOnGUI():
    File = open(TempDirectoryPath('Database.data'), "r", encoding='utf-8')  # Corrected typo: 'Databas' to 'Database'
    Data = File.read()
    if len(str(Data)) > 0:
        lines = Data.split('\n')
        result = '\n'.join(lines)  # Corrected typo: 'reslut' to 'result'
        File.close()
        File = open(TempDirectoryPath('Responses.data'), "w", encoding='utf-8')
        File.write(result)
        File.close()

def InitialExecution():
    SetMicrophoneStatus("False")
    ShowTextToScreen("")
    ShowDefultChatIfNoChats()  # Corrected typo in function call
    ChatLogIntegration()
    ShowCatsOnGUI()


InitialExecution()

def MainExecution():  # Fixed missing colon
    TaskExecution = False
    ImageExecution = False
    ImageGenerationQuery = ""

    SetAssistantStatus("Listening....")
    Query = SpeechRecognition()

    # Ensure the Query is valid and not empty
    if not Query or not Query.strip():
        print("No valid input detected, retrying...")
        return  # Or handle the case where there's no valid input

    ShowTextToScreen(f"{Username} : {Query}")
    SetAssistantStatus("Thinking...")

    try:
        Decision = FirstlayerDMM(Query)  # Proceed with the decision-making process
    except Exception as e:
        print(f"Error in FirstlayerDMM: {e}")
        return  # Handle the error and prevent crashing

    print("")
    print(f"Decision : {Decision}")

    G = any([i for i in Decision if i.startswith("general")])
    R = any([i for i in Decision if i.startswith("realtime")])

    Mearged_query = " and ".join(
        ["".join(i.split()[1:]) for i in Decision if i.startswith("general") or i.startswith("realtime")]
    )

    for queries in Decision:
        if "generate" in queries:
            ImageGenerationQuery = str(queries)
            ImageExecution = True

    for queries in Decision:
        if TaskExecution == False:
            if any(queries.startswith(func) for func in Functions):
                run(Automation(list(Decision)))
                TaskExecution = True

    if ImageExecution == True:
        with open(r"frountend\Files\imagegenration.data", "w") as file:
            file.write(f"{ImageGenerationQuery},True")

        try:
            p1 = subprocess.Popen(['python', r'backend\imageGeneration.py'],
                                  stdout=subprocess, stderr=subprocess.PIPE,
                                  stdin=subprocess.PIPE, shell=False)

            subprocess.append(p1)

        except Exception as e:
            print(f"Error starting ImageGeneration.py: {e}")

    if G and R or R:
        SetAssistantStatus("Searching...")
        Answer = RealtimeSearchEngine(QueryModifier(Mearged_query))
        ShowTextToScreen(f"{Assistantname} : {Answer}")
        TextToSpeech(Answer)  # Ensure this works correctly
        return True

    else:
        for Queries in Decision:
            if "general" in Queries:
                SetAssistantStatus("Thinking...")
                QueryFinal = Queries.replace("general", "")
                Answer = Chatbot(QueryModifier(QueryFinal))
                ShowTextToScreen(f"{Assistantname} : {Answer}")
                SetAssistantStatus("Answering...")
                TextToSpeech(Answer)  # Ensure this works correctly
                return True

            elif "realtime" in Queries:
                SetAssistantStatus("Searching...")
                QueryFinal = Queries.replace("realtime", "")
                Answer = RealtimeSearchEngine(QueryModifier(QueryFinal))
                ShowTextToScreen(f"{Assistantname} : {Answer}")
                SetAssistantStatus("Answering...")
                TextToSpeech(Answer)  # Ensure this works correctly
                return True

            elif "exit" in Queries:
                QueryFinal = "Okay , Bye"
                Answer = Chatbot(QueryModifier(QueryFinal))
                ShowTextToScreen(f"{Assistantname} : {Answer}")
                SetAssistantStatus("Answering...")
                TextToSpeech(Answer)  # Ensure this works correctly
                SetAssistantStatus("Answering...")
                os._exit(1)

def FirstThread():
    while True:
        CurrentStatus = GetMicrophoneStatus()

        if CurrentStatus == "True":
            MainExecution()

        else:
            AIStatus = GetAssistantStatus()
            if "Available..." in AIStatus:
                sleep(0.1)

            else:
                SetAssistantStatus("Available")

def SecondThread():
    GraphicalUserInterface()

def test_speech(text):
    """Test function to check if TextToSpeech works outside the main program flow."""
    try:
        print("Speaking now: ", text)
        engine = pyttsx3.init()  # Ensure this is correctly initialized
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Error in TextToSpeech: {e}")

if __name__ == "__main__":
    thread2 = threading.Thread(target=FirstThread, daemon=True)
    thread2.start()
    SecondThread()

    # Test TextToSpeech with a simple example
    test_speech("Hello, I am speaking!")
