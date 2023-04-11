# Ways of working
A collection of conventions/guidelines we agree on

## Some vocabulary from the agile world
- Backlog grooming: Looking over our backlog and decide which stories we want to keep or prioritize
- Backlog refinement: The group or pair goes through newly added stories, refines them and informs the rest what the intend of the story is (somehow also the effort is estimated)

## Our story lifecycle
### Backlog
- This is just an storage for ideas and a future roadmap not yet fully defined
- Feel free to add your own ideas (or bug fixes) to the backlog

### Ready to pick up
- Once stores are fully refined two pairs can pick the story and start playing it
- Usually it makes sense to make a **kick-off**, a short meeting with the person who refined the story to clarify remaining questions

### In progress
- Usually two develpers work on a story
- There is a maximum amount of stories in parallel allowed to limit the number of simultaneous changes to the codebase

### In Review
- Once you are finished with the story you can move the story in this column
  - all acceptance criteria are met
  - Everything is tested (manually at least)
  - A PR is open (maybe with some comments so the review knows what to look for)
  - In case you have some open question, put them also into the PR
- You move the card to the DONE column once you
  - The PR is reviewed by someone else
  - Present the feature to the PO
  - only then it can move to the last column and you can pick a new story

### Definition of Done (DoD)
- Sign-Off with (at least) Product Owner / Design Team (Usually right after standup)
- Code reviewed by someone outside of your pair
- PR rebased into main branch
