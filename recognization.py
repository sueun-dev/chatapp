import speech_recognition as sr
import pyttsx3
import openai
import re

# Set up OpenAI API key
openai.api_key = "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"

# Initialize text-to-speech engine
engine = pyttsx3.init()

def listen():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        r.adjust_for_ambient_noise(source)
        audio = r.listen(source)
    try:
        text = r.recognize_google(audio)
        print(f"You said: {text}")
        return text
    except:
        return ""

def ask_gpt3(question):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": question}],
        max_tokens=100,
        n=1,
        temperature=0.5,
    )
    answer = response.choices[0].message['content'].strip()
    return answer

def speak(text):
    print(f"Answer: {text}")
    engine.say(text)
    engine.runAndWait()

while True:
    text = listen()
    print(f"Recognized text: {text}")  # Add this line for debugging
    if "megan" in text.lower():  # Make the keyword check case-insensitive
        question = re.sub(r'\bMegan\b', '', text, flags=re.IGNORECASE)
        if not question.strip():
            speak("Yes!")
        else:
            print(f"Question: {question}")
            answer = ask_gpt3(question)
            speak(answer)
