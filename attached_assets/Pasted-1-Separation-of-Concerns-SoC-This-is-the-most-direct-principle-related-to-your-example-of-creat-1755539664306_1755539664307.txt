1. Separation of Concerns (SoC)

This is the most direct principle related to your example of "creating separate files for components." It means you should break a program into distinct parts, each addressing a separate concern.

Instruction: "Follow the Separation of Concerns principle. Separate the component's structure (HTML/JSX), behavior (JavaScript/TypeScript), and presentation (CSS/styling) into different files. For a React component, this means the .tsx file should only handle logic and markup, while a separate file (e.g., a .css or .scss file) handles the styling."

2. Single Responsibility Principle (SRP)

Part of the famous SOLID principles, SRP states that a module, class, or function should have only one reason to change. This leads to highly cohesive code.

Instruction: "Adhere to the Single Responsibility Principle. Each component should have a single, well-defined purpose. For example, a UserProfile component should be responsible only for displaying user information, not for fetching data from the API or handling authentication. Create separate services or utility files for those other concerns."

3. Loose Coupling & High Cohesion

These two concepts work together to create maintainable code.

Loose Coupling means that modules are as independent as possible, with minimal dependencies on each other.

High Cohesion means that the elements within a module are closely related and work together to achieve a common goal.

Instruction: "Ensure the code has high cohesion and loose coupling. Components should be self-contained and focused on a single task. Avoid tight dependencies between components by using props for communication instead of reaching into other components' internal state."

4. Don't Repeat Yourself (DRY)

The DRY principle is all about reducing code duplication. When you find yourself writing the same piece of logic or markup more than once, it's a good sign that it should be refactored into a reusable function, component, or utility.

Instruction: "Apply the Don't Repeat Yourself (DRY) principle. If you find yourself writing the same code in multiple places (e.g., a button style, a data fetching function, or a validation helper), refactor it into a reusable component, hook, or utility function."

5. YAGNI ("You Aren't Gonna Need It")

This principle is a reminder to avoid over-engineering. Don't add functionality or complexity to your code until it is explicitly needed.

Instruction: "Follow the YAGNI principle. Only implement the features and functionality that are requested. Avoid adding extra code or architectural patterns that are not necessary for the current requirements, as this can lead to unnecessary complexity."

How to use these in your prompts:

You can add these principles as a preamble to your prompt to set the context for the AI.

Example Prompt:

"I need you to create a web application using React, TypeScript, and Tailwind CSS.

Your task is to follow these core software design principles:

Separation of Concerns: Separate the component logic, styling, and business logic into different files.

Single Responsibility Principle (SRP): Each component should have a single, well-defined purpose.

DRY: Create reusable components and utility functions to avoid code duplication.

Now, create a Dashboard page that displays a list of recent user activity. This page should have a UserActivityList component and a RecentEvents component. The data for these components should be fetched from a separate api.ts file."