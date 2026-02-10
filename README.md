#  Advanced SDE Question Tracker (Strivers A2Z DSA Edition)

An interactive, high-performance progress tracker designed specifically for the **Strivers A2Z DSA Sheet**. This project was developed as an internship assignment to demonstrate advanced React state management, performance optimization, and UI/UX improvements over existing platforms.

---

###  The "Internship Challenge": Solving Platform Gaps
To fulfill the requirement of implementing improvements missing on current platforms, I focused on the following features:

* **Undo State History**: Revert accidental drag-and-drop rearrangements via the `Ctrl+Z` keyboard shortcut or a dedicated floating UI button.
* **Hierarchical Search Pruning**: A custom search logic that prunes empty topic headers and highlights matching text in real-time.
* **Segmented Progress Logic**: A three-part progress bar that tracks **Easy**, **Medium**, and **Hard** problems proportionally rather than as a single bulk percentage.
* **Global Layout Toggles**: "Expand All" and "Collapse All" features to manage the massive 450+ question dataset efficiently.
* **Full CRUD Capabilities**: Ability to dynamically update question names, problem URLs, and YouTube resource links.
* **UX-Focused UI**: Advanced CSS truncation prevents long topic headings from breaking the layout, ensuring a single-line view across all devices.
* **Navigation Utilities**: A smooth-scroll "Back to Top" button that appears contextually based on scroll depth.

---

###  Technical Challenges & Solutions

#### 1. Managing Nested Data Integrity
**Challenge**: The Strivers A2Z dataset is deeply nested (Topic > Sub-topic > Question). Maintaining state integrity during drag-and-drop actions across levels is complex.
**Solution**: I utilized **Zustand** for centralized state management. I developed a recursive update logic that ensures when an item is moved or edited, the global progress bars and parent-child relationships update instantly without page refreshes.



#### 2. Performance-Optimized Filtering
**Challenge**: Filtering through 450+ questions can cause UI lag and leave behind cluttered, empty headers.
**Solution**: I implemented a "Pruning" filter using `useMemo`. If a topic branch contains no matching questions, it is pruned from the render tree, significantly reducing DOM nodes and providing a clean search experience.

#### 3. State History (Undo Functionality)
**Challenge**: Implementing "Undo" for complex drag-and-drop requires tracking state snapshots without excessive memory consumption.
**Solution**: I built a custom history stack within the Zustand store. Every successful move action pushes a snapshot of the `topics` array onto a stack. The `Ctrl+Z` listener and the Undo button then pop from this stack to revert the application to its previous valid state.



---

### 🛠️ Tech Stack
* **Frontend**: React (Vite)
* **State Management**: Zustand (with custom history stack for Undo)
* **Drag & Drop**: @dnd-kit (Core, Sortable, Utilities)
* **Styling**: Tailwind CSS (supporting full Dark/Light mode transitions)
* **Icons**: Lucide-React

---

###  Getting Started

1.  **Clone the repo**:
    ```bash
    git clone [https://github.com/hello-world-coder321/question-tracker.git](https://github.com/hello-world-coder321/question-tracker.git)
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Launch the application**:
    ```bash
    npm run dev
    ```
