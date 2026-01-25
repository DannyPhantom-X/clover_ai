from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langgraph.prebuilt import create_react_agent
from langchain.tools import tool
from langchain_groq import ChatGroq
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()
import os
qroq_api_key = os.getenv("GROQ_API_KEY")
app  = FastAPI()
tools = []
model = ChatGroq(model="llama-3.1-8b-instant", api_key=qroq_api_key)

system_message = (
    "You an AI called clover ai"
)
class Prompt_one(BaseModel):
    question: str
    conversation: list[dict]

@app.post('/c/generate')
def chatResponse(prompt: Prompt_one):
    print('generating chat. . .')
    with open("systemchatmessage.txt", "r") as f:
        system_message = f.read()
    tru_conversation = [SystemMessage(content=system_message)]
    if len(prompt.conversation) > 0:
        for con in prompt.conversation:
            tru_conversation.append(HumanMessage(content=con["userQuestion"]))
            tru_conversation.append(AIMessage(content=con["cloverResponse"]))

    tru_conversation.append(HumanMessage(content=prompt.question))
    clover  = create_react_agent(model, tools)
    cloverResponse = clover.invoke({"messages" : tru_conversation})
    return {"reply": cloverResponse["messages"][-1].content}


@app.get('/')
def trial():
    print('working')
    return 'working'