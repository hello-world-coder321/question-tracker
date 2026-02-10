#  Advanced SDE Question Tracker

A high-performance React application designed to manage and track progress through the Strivers A2Z DSA Sheet. This project implements several advanced functionalities currently missing from standard tracking platforms.

###  Advanced Features
- **Undo History**: Built-in state history allowing users to undo rearrangements (Drag & Drop) via `Ctrl+Z` or a dedicated UI button.
- **Hierarchical Search**: Real-time filtering that prunes empty topics and highlights matching text.
- **Proportional Progress**: A three-part segmented progress bar tracking Easy, Medium, and Hard completion rates separately.
- **Dynamic UI**: Includes "Expand/Collapse All" toggles, smooth-scroll navigation, and single-line text truncation for clean headings.
- **Full Customization**: Ability to manually edit any data point, including problem URLs and resource links.

###  Tech Stack
- **React** (Vite)
- **Zustand** (State & History Management)
- **Dnd-kit** (Drag and Drop)
- **Tailwind CSS** (Responsive Styling)
- **Lucide-React** (Iconography)
