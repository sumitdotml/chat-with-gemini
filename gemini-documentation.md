Taken from: https://ai.google.dev/gemini-api/docs/text-generation?lang=python

Text generation

Python Node.js Go REST

The Gemini API can generate text output when provided text, images, video, and audio as input.

This guide shows you how to generate text using the generateContent and streamGenerateContent methods. To learn about working with Gemini's vision and audio capabilities, refer to the Vision and Audio guides.

Generate text from text-only input
The simplest way to generate text using the Gemini API is to provide the model with a single text-only input, as shown in this example:

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
model="gemini-2.0-flash",
contents=["How does AI work?"])
print(response.text)
In this case, the prompt ("Explain how AI works") doesn't include any output examples, system instructions, or formatting information. It's a zero-shot approach. For some use cases, a one-shot or few-shot prompt might produce output that's more aligned with user expectations. In some cases, you might also want to provide system instructions to help the model understand the task or follow specific guidelines.

Generate text from text-and-image input
The Gemini API supports multimodal inputs that combine text and media files. The following example shows how to generate text from text-and-image input:

from PIL import Image
from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

image = Image.open("/path/to/organ.png")
response = client.models.generate_content(
model="gemini-2.0-flash",
contents=[image, "Tell me about this instrument"])
print(response.text)
Generate a text stream
By default, the model returns a response after completing the entire text generation process. You can achieve faster interactions by not waiting for the entire result, and instead use streaming to handle partial results.

The following example shows how to implement streaming using the streamGenerateContent method to generate text from a text-only input prompt.

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content_stream(
model="gemini-2.0-flash",
contents=["Explain how AI works"])
for chunk in response:
print(chunk.text, end="")
Create a chat conversation
The Gemini SDK lets you collect multiple rounds of questions and responses, allowing users to step incrementally toward answers or get help with multipart problems. This SDK feature provides an interface to keep track of conversations history, but behind the scenes uses the same generateContent method to create the response.

The following code example shows a basic chat implementation:

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

chat = client.chats.create(model="gemini-2.0-flash")
response = chat.send_message("I have 2 dogs in my house.")
print(response.text)
response = chat.send_message("How many paws are in my house?")
print(response.text)
for message in chat.\_curated_history:
print(f'role - ', message.role, end=": ")
print(message.parts[0].text)
You can also use streaming with chat, as shown in the following example:

from google import genai

client = genai.Client(api_key="GEMINI_API_KEY")

chat = client.chats.create(model="gemini-2.0-flash")
response = chat.send_message_stream("I have 2 dogs in my house.")
for chunk in response:
print(chunk.text, end="")
response = chat.send_message_stream("How many paws are in my house?")
for chunk in response:
print(chunk.text, end="")
for message in chat.\_curated_history:
print(f'role - ', message.role, end=": ")
print(message.parts[0].text)
Configure text generation
Every prompt you send to the model includes parameters that control how the model generates responses. You can use GenerationConfig to configure these parameters. If you don't configure the parameters, the model uses default options, which can vary by model.

The following example shows how to configure several of the available options.

from google import genai
from google.genai import types

client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
model="gemini-2.0-flash",
contents=["Explain how AI works"],
config=types.GenerateContentConfig(
max_output_tokens=500,
temperature=0.1
)
)
print(response.text)
Add system instructions
System instructions let you steer the behavior of a model based on your specific needs and use cases.

By giving the model system instructions, you provide the model additional context to understand the task, generate more customized responses, and adhere to specific guidelines over the full user interaction with the model. You can also specify product-level behavior by setting system instructions, separate from prompts provided by end users.

You can set system instructions when you initialize your model:

sys_instruct="You are a cat. Your name is Neko."
client = genai.Client(api_key="GEMINI_API_KEY")

response = client.models.generate_content(
model="gemini-2.0-flash",
config=types.GenerateContentConfig(
system_instruction=sys_instruct),
contents=["your prompt here"]
)
Then, you can send requests to the model as usual.
