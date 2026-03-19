DROP TABLE IF EXISTS QuizAttempts;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Topics;
DROP TABLE IF EXISTS Questions;

CREATE TABLE Topics (
    topic_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name TEXT NOT NULL,
    category TEXT NOT NULL
);

CREATE TABLE Questions (
    question_id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK(difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    question_text TEXT NOT NULL,
    option1 TEXT NOT NULL,
    option2 TEXT NOT NULL,
    option3 TEXT NOT NULL,
    option4 TEXT NOT NULL,
    correct_option INTEGER NOT NULL,
    explanation TEXT,
    FOREIGN KEY (topic_id) REFERENCES Topics (topic_id)
);

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    login_streak INTEGER NOT NULL DEFAULT 1,
    max_login_streak INTEGER NOT NULL DEFAULT 1,
    last_login_date TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE QuizAttempts (
    attempt_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    overall_score INTEGER NOT NULL,
    beginner_score INTEGER NOT NULL,
    intermediate_score INTEGER NOT NULL,
    advanced_score INTEGER NOT NULL,
    questions_answered INTEGER NOT NULL,
    best_streak INTEGER NOT NULL,
    highest_level TEXT NOT NULL CHECK(highest_level IN ('Beginner', 'Intermediate', 'Advanced')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users (user_id),
    FOREIGN KEY (topic_id) REFERENCES Topics (topic_id)
);

INSERT INTO Topics (topic_name, category) VALUES
('Data Structures', 'Core CS'),
('Algorithms', 'Core CS'),
('Operating Systems', 'Core CS'),
('Database Management Systems', 'Core CS'),
('Computer Networks', 'Core CS'),
('Object Oriented Programming', 'Core CS'),
('Computer Organization', 'Core CS'),
('Software Engineering', 'Core CS');

INSERT INTO Questions (topic_id, difficulty, question_text, option1, option2, option3, option4, correct_option, explanation) VALUES
(1, 'Beginner', 'Which data structure follows Last In First Out ordering?', 'Queue', 'Stack', 'Heap', 'Graph', 2, 'A stack removes the most recently inserted element first, which is the LIFO rule.'),
(1, 'Beginner', 'Which data structure stores key-value pairs?', 'Array', 'Hash table', 'Stack', 'Tree traversal', 2, 'Hash tables map keys to values and are commonly used for dictionaries or maps.'),
(1, 'Beginner', 'Which structure is best described as first in first out?', 'Queue', 'Stack', 'Tree', 'Set', 1, 'Queues process elements in the same order they are inserted, so they are FIFO.'),
(1, 'Intermediate', 'What is the time complexity of accessing an element by index in an array?', 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 1, 'Arrays support constant-time indexed access because the memory address is computed directly.'),
(1, 'Intermediate', 'What is the worst-case search time in a balanced binary search tree?', 'O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 2, 'A balanced BST keeps height near log n, so search is O(log n) in the worst case.'),
(1, 'Intermediate', 'Which traversal of a binary search tree returns keys in sorted order?', 'Preorder', 'Inorder', 'Postorder', 'Level order', 2, 'Inorder traversal of a BST visits nodes in nondecreasing key order.'),
(1, 'Advanced', 'Which data structure is typically used to implement Dijkstra''s algorithm efficiently?', 'Stack', 'Hash set', 'Priority queue', 'Linked list', 3, 'A priority queue lets the algorithm repeatedly extract the smallest tentative distance efficiently.'),
(1, 'Advanced', 'Amortized O(1) append is a common property of which structure?', 'Dynamic array', 'Singly linked list tail insertion without tail pointer', 'Binary heap delete-min', 'Balanced BST insertion', 1, 'Dynamic arrays occasionally resize, but appends average to amortized constant time.'),
(1, 'Advanced', 'Which statement about a min-heap is true?', 'Every subtree is sorted', 'The root is the minimum element', 'Inorder traversal is sorted', 'Search is O(log n)', 2, 'A min-heap guarantees only that each parent is less than or equal to its children, so the root is minimum.'),

(2, 'Beginner', 'Which notation expresses the upper bound of an algorithm''s growth?', 'Big O', 'Theta only', 'Little omega', 'Lambda', 1, 'Big O notation describes an asymptotic upper bound on growth.'),
(2, 'Beginner', 'Binary search requires the input data to be:', 'Random', 'Sorted', 'Unique only', 'Stored in a graph', 2, 'Binary search works by comparing against the middle of a sorted range.'),
(2, 'Beginner', 'Which sorting algorithm repeatedly swaps adjacent out-of-order elements?', 'Merge sort', 'Quick sort', 'Bubble sort', 'Heap sort', 3, 'Bubble sort compares neighboring items and swaps them when they are out of order.'),
(2, 'Intermediate', 'What is the average-case time complexity of merge sort?', 'O(n)', 'O(log n)', 'O(n log n)', 'O(n^2)', 3, 'Merge sort recursively divides and merges, leading to O(n log n) time.'),
(2, 'Intermediate', 'Dynamic programming is most useful when problems have:', 'Only greedy choices', 'Overlapping subproblems', 'No recursion', 'Only one state', 2, 'Dynamic programming reuses solutions to overlapping subproblems to avoid repeated work.'),
(2, 'Intermediate', 'Which algorithm design strategy chooses a locally optimal step at each stage?', 'Backtracking', 'Divide and conquer', 'Greedy', 'Memoization', 3, 'Greedy algorithms commit to the best immediate choice and hope it leads to a global optimum.'),
(2, 'Advanced', 'What is the worst-case time complexity of quicksort with poor pivot choices?', 'O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)', 3, 'If partitions are highly unbalanced, quicksort degrades to quadratic time.'),
(2, 'Advanced', 'The recurrence T(n) = 2T(n/2) + O(n) solves to:', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)', 3, 'By the Master Theorem, this divide-and-conquer recurrence is O(n log n).'),
(2, 'Advanced', 'Which shortest path algorithm can handle negative edge weights when no negative cycle exists?', 'Dijkstra''s algorithm', 'Bellman-Ford', 'Prim''s algorithm', 'Kruskal''s algorithm', 2, 'Bellman-Ford supports negative weights and can also detect negative cycles.'),

(3, 'Beginner', 'Which component schedules processes for CPU execution?', 'Compiler', 'Scheduler', 'Loader', 'Assembler', 2, 'The operating system scheduler decides which process or thread runs next.'),
(3, 'Beginner', 'RAM is considered which kind of memory?', 'Secondary memory', 'Volatile memory', 'Optical memory', 'Archive memory', 2, 'RAM loses its contents when power is removed, so it is volatile.'),
(3, 'Beginner', 'Which system call family is used to create a new process in Unix-like systems?', 'open', 'fork', 'exec only', 'wait only', 2, 'fork creates a child process, often followed by exec to run a new program.'),
(3, 'Intermediate', 'What is the main purpose of virtual memory?', 'Increase monitor resolution', 'Provide the illusion of a larger contiguous memory space', 'Prevent compilation', 'Replace CPU registers', 2, 'Virtual memory maps addresses so programs can use more flexible address spaces than physical RAM alone.'),
(3, 'Intermediate', 'Which CPU scheduling algorithm may cause starvation of long jobs?', 'Round robin', 'First come first served', 'Shortest job first', 'Multilevel feedback with aging only', 3, 'Shortest job first can repeatedly favor short jobs and delay long ones indefinitely.'),
(3, 'Intermediate', 'A deadlock requires which condition among the following?', 'Infinite RAM', 'Mutual exclusion', 'Only one process', 'No shared resources', 2, 'Mutual exclusion is one of the Coffman conditions required for deadlock.'),
(3, 'Advanced', 'What is thrashing in an operating system?', 'Context switching due to too many runnable processes', 'Excessive paging causing very low useful CPU work', 'Disk fragmentation', 'Corrupted kernel modules', 2, 'Thrashing happens when the system spends most of its time swapping pages instead of executing work.'),
(3, 'Advanced', 'Which page replacement policy replaces the page that will not be used for the longest future time?', 'FIFO', 'LRU', 'Optimal', 'Clock', 3, 'The optimal policy uses future knowledge and is a theoretical benchmark for page replacement.'),
(3, 'Advanced', 'In a readers-writers problem, starvation means:', 'Readers and writers never enter the critical section', 'A thread waits indefinitely while others continue progressing', 'The shared data is deleted', 'The OS crashes', 2, 'Starvation occurs when a process or thread is perpetually denied needed access.'),

(4, 'Beginner', 'Which SQL command is used to retrieve data?', 'SELECT', 'UPDATE', 'DELETE', 'INSERT', 1, 'SELECT is used to query rows from one or more tables.'),
(4, 'Beginner', 'A primary key should be:', 'Optional and duplicated', 'Unique and not null', 'Always a string', 'Only used in views', 2, 'Primary keys uniquely identify rows and cannot be null.'),
(4, 'Beginner', 'Which normal form removes repeating groups and requires atomic values?', '1NF', '2NF', '3NF', 'BCNF', 1, 'First normal form requires each attribute to contain only atomic values.'),
(4, 'Intermediate', 'Which JOIN returns rows with matching values in both tables?', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL OUTER JOIN only', 3, 'INNER JOIN keeps only rows that satisfy the join condition on both sides.'),
(4, 'Intermediate', 'A foreign key is used to:', 'Sort records', 'Link rows between tables', 'Encrypt columns', 'Create indexes only', 2, 'Foreign keys enforce relationships between tables by referencing primary keys.'),
(4, 'Intermediate', 'Which index type is commonly used by relational databases for range queries?', 'Bitmap in every case', 'Hash only', 'B-tree', 'Trie only', 3, 'B-tree indexes preserve order and are efficient for point and range lookups.'),
(4, 'Advanced', 'Which isolation anomaly can occur under Read Committed but is prevented by Repeatable Read?', 'Dirty read', 'Lost disk block', 'Non-repeatable read', 'Schema mismatch', 3, 'Repeatable Read prevents seeing a different committed value for the same row during one transaction.'),
(4, 'Advanced', 'Normalization primarily helps reduce:', 'Query syntax', 'Redundancy and update anomalies', 'CPU frequency', 'Foreign keys', 2, 'Normalization organizes data to reduce duplication and avoid anomalies during updates.'),
(4, 'Advanced', 'In ACID properties, durability means:', 'Transactions can be rolled back', 'Committed changes persist after failures', 'Only one transaction runs at a time', 'Tables never need backups', 2, 'Durability guarantees committed data survives crashes or power loss.'),

(5, 'Beginner', 'Which layer of the OSI model is responsible for routing packets?', 'Transport', 'Network', 'Session', 'Presentation', 2, 'The network layer handles logical addressing and routing between networks.'),
(5, 'Beginner', 'Which protocol is commonly used to fetch web pages?', 'FTP', 'SMTP', 'HTTP', 'ARP', 3, 'HTTP is the standard application protocol used for web content transfer.'),
(5, 'Beginner', 'What does IP stand for in networking?', 'Internet Protocol', 'Internal Process', 'Interface Port', 'Integrated Packet', 1, 'IP stands for Internet Protocol.'),
(5, 'Intermediate', 'TCP provides which of the following?', 'Connectionless unreliable delivery', 'Reliable ordered delivery', 'Broadcast addressing', 'Name resolution', 2, 'TCP ensures ordered, reliable byte-stream delivery between endpoints.'),
(5, 'Intermediate', 'DNS primarily translates:', 'MAC addresses to switches', 'Domain names to IP addresses', 'Ports to processes only', 'HTTP to HTTPS', 2, 'DNS maps human-readable domain names to IP addresses.'),
(5, 'Intermediate', 'Which device forwards frames using MAC addresses?', 'Router', 'Switch', 'Gateway only', 'Repeater only', 2, 'Switches operate at the data link layer and forward frames based on MAC addresses.'),
(5, 'Advanced', 'What is the purpose of a subnet mask?', 'Encrypt packets', 'Identify network and host portions of an IP address', 'Guarantee TCP ordering', 'Assign MAC addresses', 2, 'A subnet mask separates the network prefix from the host portion of an IP address.'),
(5, 'Advanced', 'Which congestion-control behavior is associated with TCP slow start?', 'Linear window increase from the beginning', 'Exponential growth of congestion window initially', 'No acknowledgements are used', 'Immediate retransmission timeout disable', 2, 'TCP slow start increases the congestion window rapidly at first, approximately doubling each round-trip.'),
(5, 'Advanced', 'Which protocol resolves an IPv4 address to a MAC address on a local network?', 'ICMP', 'ARP', 'BGP', 'DHCP', 2, 'ARP is used to discover the MAC address corresponding to a known IPv4 address.'),

(6, 'Beginner', 'Which OOP principle bundles data and methods together?', 'Encapsulation', 'Compilation', 'Fragmentation', 'Scheduling', 1, 'Encapsulation groups state and behavior inside classes or objects.'),
(6, 'Beginner', 'An object is an instance of a:', 'Loop', 'Class', 'Package', 'Thread', 2, 'Objects are created from classes.'),
(6, 'Beginner', 'Which feature allows one class to reuse properties of another?', 'Inheritance', 'Tokenization', 'Serialization only', 'Deadlock', 1, 'Inheritance lets a derived class reuse and extend a base class.'),
(6, 'Intermediate', 'Polymorphism allows code to:', 'Run only once', 'Treat different object types through a common interface', 'Avoid functions', 'Remove all inheritance', 2, 'Polymorphism lets one interface work with many related implementations.'),
(6, 'Intermediate', 'Method overriding occurs when:', 'A subclass defines a method with the same signature as the parent', 'A method has too many parameters', 'A constructor is deleted', 'A variable changes type', 1, 'Overriding replaces or customizes inherited behavior in a subclass.'),
(6, 'Intermediate', 'Which access modifier usually restricts direct access from outside a class?', 'Public', 'Private', 'Static', 'Final', 2, 'Private members are intended for use only within the declaring class.'),
(6, 'Advanced', 'Abstraction in OOP mainly focuses on:', 'Showing every internal detail', 'Exposing essential behavior while hiding implementation details', 'Replacing classes with arrays', 'Preventing object creation', 2, 'Abstraction provides a simplified interface while keeping internal complexity hidden.'),
(6, 'Advanced', 'Which design principle suggests software entities should be open for extension but closed for modification?', 'Single Responsibility Principle', 'Open-Closed Principle', 'Liskov Substitution Principle', 'YAGNI', 2, 'The Open-Closed Principle encourages extending behavior without changing stable existing code.'),
(6, 'Advanced', 'Composition is often preferred over inheritance because it:', 'Always improves asymptotic complexity', 'Can reduce tight coupling and increase flexibility', 'Eliminates objects', 'Removes the need for interfaces', 2, 'Composition often leads to more modular designs than deep inheritance hierarchies.'),

(7, 'Beginner', 'Which component executes instructions in a computer?', 'Compiler', 'CPU', 'Database', 'Monitor', 2, 'The CPU fetches, decodes, and executes instructions.'),
(7, 'Beginner', 'Which number system is most directly used by digital hardware?', 'Decimal', 'Binary', 'Hexadecimal only', 'Roman', 2, 'Digital circuits represent values primarily using binary states.'),
(7, 'Beginner', 'Which memory is closest to the CPU and usually the fastest?', 'Hard disk', 'Main memory', 'Cache', 'Optical disk', 3, 'Cache memory is small but very fast and sits close to the CPU.'),
(7, 'Intermediate', 'What does the ALU primarily handle?', 'Network routing', 'Arithmetic and logic operations', 'Persistent storage', 'User authentication', 2, 'The ALU performs mathematical calculations and logical comparisons.'),
(7, 'Intermediate', 'A pipeline hazard occurs when:', 'The keyboard disconnects', 'Instruction execution overlaps create conflicts or stalls', 'RAM becomes read-only', 'The compiler is missing', 2, 'Pipeline hazards are conflicts that interfere with smooth overlapped instruction execution.'),
(7, 'Intermediate', 'Which addressing mode uses the operand value directly in the instruction?', 'Immediate addressing', 'Indirect addressing', 'Indexed addressing', 'Base-relative only', 1, 'Immediate addressing embeds the actual operand in the instruction.'),
(7, 'Advanced', 'What is the main benefit of cache locality?', 'Improved instruction decoding grammar', 'Faster average memory access due to reuse of nearby data', 'Elimination of registers', 'Reduction of algorithmic complexity to O(1)', 2, 'Temporal and spatial locality help caches serve future accesses faster.'),
(7, 'Advanced', 'RISC architectures are commonly associated with:', 'Many complex variable-length instructions', 'Simpler instructions and efficient pipelining', 'No registers', 'No branching support', 2, 'RISC designs favor simpler instructions that can be executed efficiently in pipelines.'),
(7, 'Advanced', 'A control unit in the CPU is responsible for:', 'Only storing files', 'Coordinating the execution of instructions', 'Encrypting databases', 'Rendering graphics only', 2, 'The control unit directs data flow and issues the signals needed to execute instructions.'),

(8, 'Beginner', 'What is a software requirement?', 'A random coding style choice', 'A documented need or capability the system must satisfy', 'Only a test case', 'A compiled binary', 2, 'Requirements describe what the system should do or constraints it must satisfy.'),
(8, 'Beginner', 'Which development model is organized in repeating short iterations?', 'Waterfall', 'Agile', 'Assembly', 'Fork-join', 2, 'Agile development uses short iterations and regular feedback.'),
(8, 'Beginner', 'A bug found before release is usually recorded as a:', 'Database join', 'Defect or issue', 'Deployment region', 'Package manager', 2, 'Teams typically track software bugs as defects or issues.'),
(8, 'Intermediate', 'The main goal of version control is to:', 'Replace testing', 'Track changes and support collaboration', 'Compile code faster', 'Prevent documentation', 2, 'Version control systems manage changes and make collaboration safer.'),
(8, 'Intermediate', 'Unit testing focuses on:', 'The smallest testable parts of the system', 'Only user interface colors', 'Production monitoring only', 'Routing packets', 1, 'Unit tests target isolated components such as functions or classes.'),
(8, 'Intermediate', 'Which artifact often captures interactions between actors and a system?', 'Use case diagram', 'Binary tree', 'Heap dump', 'Linker map', 1, 'Use case diagrams model high-level user interactions with the system.'),
(8, 'Advanced', 'Continuous integration mainly encourages teams to:', 'Merge code rarely', 'Integrate and test changes frequently', 'Avoid automation', 'Delay bug fixes until release', 2, 'Continuous integration catches integration problems earlier by building and testing often.'),
(8, 'Advanced', 'Which metric best reflects how often production-ready code is delivered?', 'Cyclomatic complexity', 'Deployment frequency', 'Cache hit rate', 'Page fault count', 2, 'Deployment frequency measures how often the team successfully releases to production.'),
(8, 'Advanced', 'A non-functional requirement usually describes:', 'A specific business rule only', 'Quality attributes like performance or reliability', 'Source code indentation only', 'Database row counts', 2, 'Non-functional requirements describe qualities such as speed, availability, and security.');
