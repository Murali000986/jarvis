import asyncio
from random import randint
from PIL import Image
import requests
from dotenv import get_key
import os
from time import sleep


def open_image(prompt):
    folder_path = r"C:\Users\Rinku\Desktop\jarvis3.0\data"  # Path where images are saved
    prompt = prompt.replace(" ", "_")  # Ensure spaces in prompt are replaced by underscores for filenames

    # Correct the file naming convention (no space between prompt and number)
    files = [f"{prompt}{i}.jpg" for i in range(1, 5)]

    for jpg_file in files:
        image_path = os.path.join(folder_path, jpg_file)

        try:
            img = Image.open(image_path)
            print(f"Opening image: {image_path}")
            img.show()
            sleep(1)

        except IOError:
            print(f"Unable to open {image_path}")


API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
headers = {"Authorization": f"Bearer {get_key('.env', 'HuggingFaceAPIKey')}"}


async def query(payload):
    response = await asyncio.to_thread(requests.post, API_URL, headers=headers, json=payload)
    return response.content


async def generate_image(prompt: str):
    tasks = []

    for _ in range(4):
        payload = {
            "inputs": f"{prompt}, quality=4k, sharpness=maximum, Ultra High details, high resolution, seed={randint(0, 1000000)}"
        }

        task = asyncio.create_task(query(payload))
        tasks.append(task)

    image_bytes_list = await asyncio.gather(*tasks)

    # Ensure the Data folder exists
    folder_path = r"C:\Users\Rinku\Desktop\jarvis3.0\data"
    os.makedirs(folder_path, exist_ok=True)

    for i, image_bytes in enumerate(image_bytes_list):
        image_path = os.path.join(folder_path, f"{prompt.replace(' ', '_')}{i + 1}.jpg")
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        print(f"Image saved: {image_path}")


def generate_images(prompt: str):
    asyncio.run(generate_image(prompt))
    open_image(prompt)


# Update the path to your actual file location
file_path = r"C:\Users\Rinku\Desktop\jarvis3.0\frountend\Files\imagegenration.data"

while True:
    try:
        # Ensure the file exists
        if not os.path.exists(file_path):
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "w") as f:
                f.write("DefaultPrompt,False")

        # Read and process the file
        with open(file_path, "r") as f:
            Data: str = f.read()

            Prompt, Status = Data.strip().split(",")

            if Status == "True":
                print("Generating Image...")
                generate_images(prompt=Prompt)

                with open(file_path, "w") as f:
                    f.write("False,False")
                break

            else:
                sleep(1)

    except:
        pass
