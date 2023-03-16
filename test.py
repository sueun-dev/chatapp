import pyttsx3

engine = pyttsx3.init()

# Define the speak function
def speak(text):
    print(f"Answer: {text}")
    engine.say(text)
    engine.runAndWait()

# Get a list of available voices
voices = engine.getProperty('voices')

# Iterate through all voices
for index, voice in enumerate(voices):
    print(f"Voice #{index}: {voice.name} (id: {voice.id})")
    
    # Set the voice by providing the id from the list of available voices
    engine.setProperty('voice', voice.id)
    
    # Speak a sample text with the current voice
    speak(f"This is voice number {index}, {voice.name}.")
