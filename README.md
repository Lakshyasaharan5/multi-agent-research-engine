# multi-agent-research-engine
Multi agent orchestration for research and report

### Notes

- didn’t vibe code. just used AI to learn and then implemented it myself, that’s why the whole pipeline might not look that impressive but its all honest work
- Skipped UI to focus on backend system orchestration. first my goal was to finish the pipeline and then add complexity and features and then UI.
- I could have used Langchain or other frameworks but since i am learning about the agent orchestration as I build this project and these frameworks will abstract away those details so just went with custom and also for this pipeline i don’t think we need any fancy framework as the agents are sequential. also memory is shared short term so no problem.
- went with typescript because its kind of becoming the most supported for ai systems and also have type safety for better contracts. no hate for python, just wanted to learn typescript
- Vercel ai sdk, worked on a previous project, blends with typescript well, have their cloud hosting, gives access to all the models, excellent documentation.
- why only short term shared memory? its just one shot user query, keeping stateless, no users, no need for keeping conversation. also it would require me to have privacy handling if i store anything which is sensitive

### Project pipeline flow

user will give the query
safety agent which will be very light weight quickly verify all those stuff and pass it maybe also sanitize it
then planner will break it down and create tasks
research agent which will be connected to web search (this is important) will bring its finding
then critic/report agent will analyze it and create a report. should i also ask research agent to do one more try or not
then will just show the result with some citations if possible

simple caching layer which checks if the query is same then return the stored result instead of running the expensive multi agent research