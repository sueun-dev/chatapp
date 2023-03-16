import speech_recognition as sr
import pyttsx3
import openai

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

def ask_gpt3(question, conversation_history):
    conversation_history.append({"role": "user", "content": question})
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are a helpful assistant."}] + conversation_history,
        max_tokens=100,
        n=1,
        temperature=0.5,
    )
    answer = response.choices[0].message['content'].strip()
    conversation_history.append({"role": "assistant", "content": answer})
    return answer

def speak(text):
    print(f"Answer: {text}")
    engine.say(text)
    engine.runAndWait()

conversation_history = []

while True:
    text = listen()
    if text:  # If the recognized text is not empty
        print(f"Question: {text}")
        answer = ask_gpt3(text, conversation_history)
        speak(answer)
