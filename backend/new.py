import os
import time
from selenium.webdriver.chrome.service import Service
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import dotenv_values
import stranslate as mt
import noisereduce as nr
import soundfile as sf
import numpy as np

# Load environment variables
env_vars = dotenv_values(".env")
InputLanguage = env_vars.get("InputLanguage", "en")

# HTML code for speech recognition
HtmlCode = '''<!DOCTYPE html>
<html lang="en">
<head>
    <title>Speech Recognition</title>
</head>
<body>
    <button id="start" onclick="startRecognition()">Start Recognition</button>
    <button id="end" onclick="stopRecognition()">Stop Recognition</button>
    <p id="output"></p>

    <script>
        const output = document.getElementById('output');
        let recognition;

        function startRecognition() {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';  // You can set the language here
            recognition.continuous = true;
            recognition.interimResults = true;  // Add interim results to see partial recognition

            recognition.onresult = function(event) {
                const transcript = event.results[event.results.length - 1][0].transcript;
                output.textContent += transcript + ' ';
            };

            recognition.onend = function() {
                recognition.start();
            };

            recognition.start();
        }

        function stopRecognition() {
            recognition.stop();
            output.innerHTML += '<br><strong>Recognition stopped.</strong>';
        }
    </script>
</body>
</html>
'''

# Create the necessary directories if they don't exist
output_dir = r"Data\voice"
os.makedirs(output_dir, exist_ok=True)

# Update HTML with the input language
HtmlCode = str(HtmlCode).replace("recognition.lang = '';", f"recognition.lang = '{InputLanguage}';")

# Save the HTML file
with open(os.path.join(output_dir, "Voice.html"), "w") as f:
    f.write(HtmlCode)

current_dir = os.getcwd()
Link = f"{current_dir}/Data/voice/Voice.html"

# Configure Chrome options
chrome_options = Options()
user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.8.142.06 Safari/537.36"
chrome_options.add_argument(f"user-agent={user_agent}")
chrome_options.add_argument("--use-fake-ui-for-media-stream")
chrome_options.add_argument("--headless=new")

# Initialize the WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

TempDirpath = rf"{current_dir}/Frontend/Files"

def SetAssistantStatus(Status):
    with open(rf'{TempDirpath}/Status.data', "w", encoding='utf-8') as file:
        file.write(Status)

def QueryModifier(Query):
    new_query = Query.lower().strip()
    query_word = new_query.split()
    question_word = ["how", "what", "who", "where", "when", "why", "which", "whose", "whom", "can you", "what's"]

    if any(word + " " in new_query for word in question_word):
        if query_word[-1][-1] in ['.', '?', '!']:
            new_query = new_query[:-1] + "?"
        else:
            new_query += "?"
    else:
        if query_word[-1][-1] in ['.', '?', '!']:
            new_query = new_query[:-1] + "."
        else:
            new_query += "."

    return new_query.capitalize()

def UniversalTranslator(Text):
    english_translation = mt.translate(Text, "en", "auto")
    return english_translation.capitalize()

def reduce_noise(audio_path, output_path):
    """Reduce noise from audio using noisereduce."""
    data, rate = sf.read(audio_path)
    reduced_noise = nr.reduce_noise(y=data, sr=rate)
    sf.write(output_path, reduced_noise, rate)

def contextual_understanding(text):
    """Add contextual understanding using simple NLP techniques."""
    # Example: Replace common misrecognized words
    corrections = {
        "weather": "whether",
        "their": "there",
        "to": "too",
    }
    for wrong, correct in corrections.items():
        text = text.replace(wrong, correct)
    return text

def speech_recognition_with_retries(max_attempts=3):
    """Perform speech recognition with multiple attempts and error handling."""
    for attempt in range(max_attempts):
        try:
            driver.get("file:///" + Link)

            # Wait for the start button to be visible
            WebDriverWait(driver, 10).until(
                EC.visibility_of_element_located((By.ID, "start"))
            )

            # Start speech recognition by clicking the start button
            driver.find_element(by=By.ID, value="start").click()

            while True:
                try:
                    # Wait for the output to be populated
                    WebDriverWait(driver, 10).until(
                        EC.visibility_of_element_located((By.ID, "output"))
                    )

                    # Get the recognized text from the HTML element
                    Text = driver.find_element(by=By.ID, value="output").text

                    if Text:
                        # Stop speech recognition by clicking the end button
                        driver.find_element(by=By.ID, value="end").click()

                        # Apply contextual understanding
                        Text = contextual_understanding(Text)

                        # If the input language is English, return the modified query
                        if InputLanguage.lower() == "en" or "en" in InputLanguage.lower():
                            return QueryModifier(Text)
                        else:
                            SetAssistantStatus("Translating...")
                            return QueryModifier(UniversalTranslator(Text))

                except Exception as e:
                    print(f"Error while recognizing text: {e}")
                    break  # Exit the loop if an error occurs

        except Exception as e:
            print(f"Attempt {attempt + 1} failed: {e}")
            if attempt == max_attempts - 1:
                raise Exception("All recognition attempts failed.")
            time.sleep(2)  # Wait before retrying

# Main execution block
if __name__ == "__main__":
    while True:
        try:
            Text = speech_recognition_with_retries()
            print(Text)
        except Exception as e:
            print(f"Speech recognition failed: {e}")
            break