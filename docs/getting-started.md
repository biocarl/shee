## Getting started (Monday)
**Four** tasks for the afternoon

Following groups (stay in the room to help each other out and create a shared understanding of the codebase)

       | Name      | Group   | 
       |-----------|---------|
       | Sebastian | Group 1 | 
       | Bodo      | Group 1 |
       | Marc      | Group 1 | 
       | Tamayo    | Group 2 | 
       | Alina     | Group 2 | 
       | Tarik     | Group 2 | 
       | Christian | Group 2 |
       | Rene      | Group 3 | 
       | Josi      | Group 3 | 
       | Minh      | Group 3 |
       | Bacdasch  | Group 3 | 

- **(1)** Create Trello Account (Username/Display Name should give away who you are) and send it to me in Chat during the day
- **(2)** Create your first Pull Request
  1. Create a branch of the project (e.g. use your gitusername)
  2. Create your first commit by adding your github username to the [Contributer Section](https://github.com/biocarl/vag/blob/main/README.md#contributors) ([example here](https://github.com/biocarl/vag/pull/1/commits/af1e250b5ca85eddb768a689e6a8e083f431c345))
  3. Push the branch and open a Pull Request - Done ✅
  4. By the end of the day everyone should have a Pull Request open simiular to [this one](https://github.com/biocarl/vag/pull/1) (do not merge/rebase to master)

- **(3)** Inception-Homework
- Think about potential solutions (shee.app can provide) you could think of for the student types we've discussed (we will need this tomorrow in the morning)

- **(4)** Get familiar with the codebase:

*When you start at a new developer job you will face a huge, new codebase. There will be some onboarding to find your way around, but most of the work you will have to do yourself. This is such a common task to do, you will find a lot of general tips online on how to do this, try queries like the following*

       - Understanding a large, legacy codebase
       - How do you dive into large code bases?

- Our new codebase: [biocarl/shee](https://github.com/biocarl/shee)

- Some tips specific to this project
  - The obvious thing you always want to do is to run the application locally (clone/run Angular app)
  - Read the `README.md`
  - Start playing around with the application (use the Chrome Developer tools, which component am I currently looking at?)
  - When you want to understand web apps, it is always a good ideas to start the journey at the routing logic (`app-routing.module.ts`)
  - You do not need to understand every technical detail, often it is enough to understand the intent of the code by reading the method names
  - Try changing something and see if it breaks or not
- Some questions to answer (this is not easy!)
  - How is a new presenter event generated?
  - How is it decided which component is shown on presenter or client side? 
