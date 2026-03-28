export const MCQ_BANK = {
    Technical: {
        CSE: {
            Python: { 
                Beginner: [
                    { id: "p1", q: "Keyword to define a function?", options: ["func", "def", "define", "function"], answer: "def", topic: "Syntax" },
                    { id: "p2", q: "Output of 3**2?", options: ["6", "9", "32", "0.33"], answer: "9", topic: "Operators" },
                    { id: "p3", q: "Which is a mutable type?", options: ["Tuple", "String", "List", "Integer"], answer: "List", topic: "Data Types" },
                    { id: "p4", q: "Extension of Python file?", options: [".pt", ".py", ".pyt", ".python"], answer: ".py", topic: "Basics" },
                    { id: "p5", q: "Creator of Python?", options: ["Dennis Ritchie", "James Gosling", "Guido van Rossum", "Bjarne Stroustrup"], answer: "Guido van Rossum", topic: "History" },
                    { id: "p6", q: "Keyword for loops?", options: ["for", "loop", "repeat", "iterate"], answer: "for", topic: "Control Flow" },
                    { id: "p7", q: "How to print to console?", options: ["echo()", "print", "print()", "console.log()"], answer: "print()", topic: "Basics" },
                    { id: "p8", q: "Boolean values are?", options: ["true / false", "True / False", "TRUE / FALSE", "1 / 0 (only)"], answer: "True / False", topic: "Data Types" },
                    { id: "p9", q: "Is Python case-sensitive?", options: ["Yes", "No", "Only for functions", "Depends on OS"], answer: "Yes", topic: "Syntax" },
                    { id: "p10", q: "List indexing starts at?", options: ["0", "1", "-1", "Depends"], answer: "0", topic: "Lists" },
                    { id: "p11", q: "What does len() do?", options: ["Returns type", "Returns count of items", "Returns memory size", "None"], answer: "Returns count of items", topic: "Functions" },
                    { id: "p12", q: "Which symbol is used for comments?", options: ["//", "/*", "#", "<!--"], answer: "#", topic: "Syntax" },
                    { id: "p13", q: "What is the output of 5 // 2?", options: ["2.5", "2", "3", "2.0"], answer: "2", topic: "Operators" },
                    { id: "p14", q: "Which of the following creates a tuple?", options: ["t = [1, 2]", "t = {1, 2}", "t = (1, 2)", "t = <1, 2>"], answer: "t = (1, 2)", topic: "Data Types" },
                    { id: "p15", q: "What data type is the result of input() in Python 3?", options: ["int", "float", "str", "bool"], answer: "str", topic: "Functions" },
                    { id: "p16", q: "How do you insert an element to a specific index in a list?", options: ["list.add()", "list.append()", "list.insert()", "list.push()"], answer: "list.insert()", topic: "Lists" },
                    { id: "p17", q: "What is used to define a block of code in Python?", options: ["Curly braces {}", "Parentheses ()", "Indentation", "Square brackets []"], answer: "Indentation", topic: "Syntax" },
                    { id: "p18", q: "Which function converts a string to a float?", options: ["int()", "float()", "str()", "double()"], answer: "float()", topic: "Functions" },
                    { id: "p19", q: "What is the logical operator for 'AND'?", options: ["&&", "AND", "and", "&"], answer: "and", topic: "Operators" },
                    { id: "p20", q: "Which method removes whitespace from the start and end of a string?", options: ["clean()", "strip()", "trim()", "remove()"], answer: "strip()", topic: "Strings" },
                ] 
            },
            Java: { 
                Beginner: [
                    { id: "j1", q: "Entry point of a Java program?", options: ["start()", "run()", "main()", "init()"], answer: "main()", topic: "Basics" },
                    { id: "j2", q: "Keyword to inherit a class?", options: ["implements", "inherits", "extends", "super"], answer: "extends", topic: "OOP" },
                    { id: "j3", q: "Default value of local variable?", options: ["null", "0", "Not assigned", "Depends on type"], answer: "Not assigned", topic: "Variables" },
                    { id: "j4", q: "Wrapper class for int?", options: ["Int", "Integer", "Number", "Long"], answer: "Integer", topic: "Classes" },
                    { id: "j5", q: "Which is used to handle exceptions?", options: ["try-catch", "throw-catch", "try-throw", "error-catch"], answer: "try-catch", topic: "Exceptions" },
                    { id: "j6", q: "Size of float in Java?", options: ["16-bit", "32-bit", "64-bit", "128-bit"], answer: "32-bit", topic: "Memory" },
                    { id: "j7", q: "Which keyword prevents method overriding?", options: ["static", "const", "final", "abstract"], answer: "final", topic: "OOP" },
                    { id: "j8", q: "Java is...", options: ["Platform dependent", "Platform independent", "Neither", "OS specific"], answer: "Platform independent", topic: "Architecture" },
                    { id: "j9", q: "Default constructor is provided by?", options: ["JVM", "Compiler", "OS", "Interpreter"], answer: "Compiler", topic: "Constructors" },
                    { id: "j10", q: "String is a...", options: ["Primitive type", "Class", "Method", "Variable"], answer: "Class", topic: "Data Types" },
                    { id: "j11", q: "Keyword to stop a loop?", options: ["stop", "pause", "resume", "break"], answer: "break", topic: "Control Flow" },
                    { id: "j12", q: "What does JVM stand for?", options: ["Java Virtual Machine", "Java Very Much", "Java Visual Machine", "Joint Virtual Machine"], answer: "Java Virtual Machine", topic: "Architecture" },
                    { id: "j13", q: "Method to find string length?", options: ["getSize()", "length()", "len()", "count()"], answer: "length()", topic: "Strings" },
                    { id: "j14", q: "Can we have multiple main methods in a class?", options: ["Yes, heavily overloaded", "Yes, overloaded", "No", "Depends on JVM"], answer: "Yes, overloaded", topic: "Methods" },
                    { id: "j15", q: "Which class is superclass of all classes?", options: ["Object", "Main", "Class", "System"], answer: "Object", topic: "OOP" },
                    { id: "j16", q: "To compile a java file:", options: ["java file.java", "javac file.java", "compile file.java", "run file.java"], answer: "javac file.java", topic: "Terminal" },
                    { id: "j17", q: "To print in Java:", options: ["echo", "System.out.println()", "console.log()", "print()"], answer: "System.out.println()", topic: "Basics" },
                    { id: "j18", q: "Is multiple inheritance supported in Java classes?", options: ["Yes", "No", "Only for abstract classes", "Only interfaces"], answer: "No", topic: "OOP" },
                    { id: "j19", q: "Difference between == and .equals()?", options: ["Same", "== compares strings", "== compares ref, equals compares value", "== is for ints"], answer: "== compares ref, equals compares value", topic: "Comparisons" },
                    { id: "j20", q: "Access modifier with widest scope?", options: ["private", "protected", "public", "default"], answer: "public", topic: "Access" }
                ] 
            },
            DBMS: { 
                Beginner: [
                    { id: "db1", q: "SQL stands for?", options: ["Structured Question Language", "Structured Query Language", "Strong Query Language", "Standard Query Language"], answer: "Structured Query Language", topic: "Basics" },
                    { id: "db2", q: "Command to remove all records but keep structure?", options: ["DROP", "DELETE", "TRUNCATE", "REMOVE"], answer: "TRUNCATE", topic: "Commands" },
                    { id: "db3", q: "Uniquely identifies a record?", options: ["Foreign Key", "Unique Key", "Primary Key", "Composite Key"], answer: "Primary Key", topic: "Keys" },
                    { id: "db4", q: "Which is a DML command?", options: ["CREATE", "ALTER", "UPDATE", "DROP"], answer: "UPDATE", topic: "Commands" },
                    { id: "db5", q: "Database properties acronym?", options: ["ACID", "BASE", "SOLID", "CRUD"], answer: "ACID", topic: "Properties" },
                    { id: "db6", q: "Command to retrieve data?", options: ["GET", "PULL", "SELECT", "FETCH"], answer: "SELECT", topic: "Commands" },
                    { id: "db7", q: "Links two tables together?", options: ["Primary Key", "Foreign Key", "Super Key", "Candidate Key"], answer: "Foreign Key", topic: "Keys" },
                    { id: "db8", q: "Which limits the number of rows?", options: ["LIMIT", "TOP", "ROWNUM", "All of the above"], answer: "All of the above", topic: "Filtering" },
                    { id: "db9", q: "Which keyword filters groups?", options: ["WHERE", "FILTER", "HAVING", "GROUP_FILTER"], answer: "HAVING", topic: "Filtering" },
                    { id: "db10", q: "Which join returns all left rows?", options: ["INNER", "LEFT", "RIGHT", "FULL"], answer: "LEFT", topic: "Joins" },
                    { id: "db11", q: "In ACID, what does C stand for?", options: ["Consistency", "Concurrency", "Control", "Commit"], answer: "Consistency", topic: "Properties" },
                    { id: "db12", q: "Eliminates duplicate rows?", options: ["UNIQUE", "DISTINCT", "NO DUPLICATES", "SINGLE"], answer: "DISTINCT", topic: "Filtering" },
                    { id: "db13", q: "Which function gets the highest value?", options: ["TOP()", "HIGH()", "MAX()", "CEIL()"], answer: "MAX()", topic: "Functions" },
                    { id: "db14", q: "DCL stands for?", options: ["Data Control Language", "Data Create Language", "Data Common Language", "None"], answer: "Data Control Language", topic: "DCL" },
                    { id: "db15", q: "Sorts the result set?", options: ["SORT BY", "ORDER BY", "GROUP BY", "ARRANGE BY"], answer: "ORDER BY", topic: "Sorting" },
                    { id: "db16", q: "Wildcard for zero or more characters in LIKE?", options: ["_", "*", "%", "?"], answer: "%", topic: "Filtering" },
                    { id: "db17", q: "Entity Relationship Diagram is?", options: ["ERD", "ARD", "PRD", "DRD"], answer: "ERD", topic: "Design" },
                    { id: "db18", q: "What does Normalization do?", options: ["Adds redundancy", "Reduces redundancy", "Increases size", "Slows database"], answer: "Reduces redundancy", topic: "Design" },
                    { id: "db19", q: "Which is not an NoSQL database?", options: ["MongoDB", "Cassandra", "Redis", "MySQL"], answer: "MySQL", topic: "Databases" },
                    { id: "db20", q: "Combines result sets of two SELECTs?", options: ["JOIN", "MERGE", "UNION", "COMBINE"], answer: "UNION", topic: "Sets" }
                ] 
            },
            "Data Structures": { 
                Beginner: [
                    { id: "ds1", q: "LIFO structure?", options: ["Queue", "List", "Tree", "Stack"], answer: "Stack", topic: "Basics" },
                    { id: "ds2", q: "FIFO structure?", options: ["Queue", "List", "Tree", "Stack"], answer: "Queue", topic: "Basics" },
                    { id: "ds3", q: "Binary search tree left child rule?", options: ["Left > Root", "Left < Root", "Left == Root", "No rule"], answer: "Left < Root", topic: "Trees" },
                    { id: "ds4", q: "Graphs contain?", options: ["Nodes & Edges", "Roots & Leaves", "Push & Pop", "Rows & Columns"], answer: "Nodes & Edges", topic: "Graphs" },
                    { id: "ds5", q: "Complexity to access array element?", options: ["O(log n)", "O(n)", "O(1)", "O(n²)"], answer: "O(1)", topic: "Complexity" },
                    { id: "ds6", q: "Which DS is non-linear?", options: ["Array", "Linked List", "Stack", "Tree"], answer: "Tree", topic: "Basics" },
                    { id: "ds7", q: "Hash table uses a?", options: ["Pointer", "Hash Function", "Tree branch", "Queue"], answer: "Hash Function", topic: "Hashing" },
                    { id: "ds8", q: "Pre-order traversal is?", options: ["Left-Root-Right", "Root-Left-Right", "Left-Right-Root", "Root-Right-Left"], answer: "Root-Left-Right", topic: "Trees" },
                    { id: "ds9", q: "Linked list stores data and?", options: ["Value", "Index", "Pointer to next", "Parent"], answer: "Pointer to next", topic: "Linked Lists" },
                    { id: "ds10", q: "Stack pointer normally starts at?", options: ["0", "1", "-1", "Depends"], answer: "-1", topic: "Stacks" },
                    { id: "ds11", q: "What is a circular queue's main benefit?", options: ["Uses less memory", "Reuses empty spaces", "Faster access", "Easy to sort"], answer: "Reuses empty spaces", topic: "Queues" },
                    { id: "ds12", q: "A completely unbalanced BST behaves like a?", options: ["Balanced Tree", "Hash Table", "Linked List", "Graph"], answer: "Linked List", topic: "Trees" },
                    { id: "ds13", q: "Which is used for breadth-first search?", options: ["Stack", "Queue", "Priority Queue", "Heap"], answer: "Queue", topic: "Graphs" },
                    { id: "ds14", q: "Which data structure is recursive?", options: ["Array", "Tree", "Queue", "Stack"], answer: "Tree", topic: "Trees" },
                    { id: "ds15", q: "Optimal worst-case sorting time?", options: ["O(n)", "O(n log n)", "O(n²)", "O(1)"], answer: "O(n log n)", topic: "Sorting" },
                    { id: "ds16", q: "A min-heap root is always?", options: ["Max value", "Min value", "Median", "Random"], answer: "Min value", topic: "Heaps" },
                    { id: "ds17", q: "Time complexity to search linked list?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], answer: "O(n)", topic: "Complexity" },
                    { id: "ds18", q: "Which graph has directions?", options: ["Undirected", "Directed", "Weighted", "Cyclic"], answer: "Directed", topic: "Graphs" },
                    { id: "ds19", q: "Adjacency matrix is used in?", options: ["Trees", "Heaps", "Graphs", "Linked Lists"], answer: "Graphs", topic: "Graphs" },
                    { id: "ds20", q: "Operation to remove from Queue?", options: ["Pop", "Dequeue", "Delete", "Remove"], answer: "Dequeue", topic: "Queues" }
                ] 
            }
        },
        IT: {
            "Cyber Security": { Beginner: [
                { id: "it1", q: "What is a firewall?", options: ["OS", "Hardware or Software filter", "Anti-virus", "Protocol"], answer: "Hardware or Software filter", topic: "Network Security" },
                { id: "it2", q: "What does VPN stand for?", options: ["Virtual Private Network", "Visual Processing Node", "Valid Port Name", "Virtual Protocol Net"], answer: "Virtual Private Network", topic: "Protocols" },
                { id: "it3", q: "Which attack floods a network with traffic?", options: ["Phishing", "DDoS", "SQL Injection", "Man-in-the-Middle"], answer: "DDoS", topic: "Attacks" },
                { id: "it4", q: "Process of scrambling data?", options: ["Hashing", "Decoding", "Encryption", "Parsing"], answer: "Encryption", topic: "Cryptography" },
                { id: "it5", q: "What is malware?", options: ["Malicious software", "Hardware defect", "Network protocol", "Defensive tool"], answer: "Malicious software", topic: "Threats" },
                { id: "it6", q: "Which port is used for HTTPS?", options: ["80", "443", "21", "22"], answer: "443", topic: "Protocols" },
                { id: "it7", q: "What is phishing?", options: ["Network scanning", "Password cracking", "Deceptive email attack", "Data encryption"], answer: "Deceptive email attack", topic: "Attacks" },
                { id: "it8", q: "What is a zero-day vulnerability?", options: ["A patched flaw", "An unknown flaw exploited before patch", "A firewall rule", "A type of virus"], answer: "An unknown flaw exploited before patch", topic: "Vulnerabilities" },
                { id: "it9", q: "What does SSL stand for?", options: ["Secure Sockets Layer", "Safe System Login", "Secure System Layer", "System Sockets Link"], answer: "Secure Sockets Layer", topic: "Cryptography" },
                { id: "it10", q: "Which is a biometric authentication method?", options: ["Password", "Smart Card", "Fingerprint", "PIN"], answer: "Fingerprint", topic: "Authentication" }
            ]},
            "Cloud Computing": { Beginner: [] },
            "Networking": { Beginner: [] },
            "Database Management": { Beginner: [] },
            "Software Engineering": { Beginner: [] },
            "Artificial Intelligence": { Beginner: [] }
        },
        ECE: {
            "Digital Electronics": { Beginner: [
                { id: "ece1", q: "What is an AND gate?", options: ["Logic Gate", "Amplifier", "Transistor", "Diode"], answer: "Logic Gate", topic: "Gates" },
                { id: "ece2", q: "Binary equivalent of decimal 10?", options: ["1010", "1100", "1001", "1110"], answer: "1010", topic: "Number Systems" },
                { id: "ece3", q: "Which gate is a Universal gate?", options: ["OR", "NAND", "XOR", "AND"], answer: "NAND", topic: "Gates" },
                { id: "ece4", q: "Flip-flops are used to store?", options: ["1 bit", "8 bits", "1 byte", "Analog voltage"], answer: "1 bit", topic: "Memory Elements" },
                { id: "ece5", q: "Boolean algebra A + A' equals?", options: ["A", "0", "1", "A'"], answer: "1", topic: "Boolean Algebra" },
                { id: "ece6", q: "Hexadecimal base is?", options: ["2", "8", "10", "16"], answer: "16", topic: "Number Systems" },
                { id: "ece7", q: "Multiplexer has how many outputs?", options: ["Many", "Two", "One", "Depends on selection lines"], answer: "One", topic: "Combinational Circuits" },
                { id: "ece8", q: "A byte consists of how many bits?", options: ["4", "8", "16", "32"], answer: "8", topic: "Basics" },
                { id: "ece9", q: "Which represents NOT operation?", options: ["Dot", "Plus", "Bar/Prime", "Asterisk"], answer: "Bar/Prime", topic: "Boolean Algebra" },
                { id: "ece10", q: "Logic state '1' corresponds to?", options: ["0 Volts", "Ground", "High Voltage", "Open Circuit"], answer: "High Voltage", topic: "Basics" }
            ]},
            "Microprocessors": { Beginner: [] },
            "Communication Systems": { Beginner: [] },
            "VLSI Design": { Beginner: [] },
            "Control Systems": { Beginner: [] },
            "Embedded Systems": { Beginner: [] }
        },
        EEE: {
            "Power Systems": { Beginner: [
                { id: "eee1", q: "What does AC stand for?", options: ["Alternating Current", "Air Con", "Auto Current", "Amp Current"], answer: "Alternating Current", topic: "Basics" },
                { id: "eee2", q: "Ohm's Law equation?", options: ["V=I/R", "V=IR", "I=VR", "R=VI"], answer: "V=IR", topic: "Laws" },
                { id: "eee3", q: "Unit of power?", options: ["Joule", "Watt", "Volt", "Ampere"], answer: "Watt", topic: "Units" },
                { id: "eee4", q: "Device to step up voltage?", options: ["Motor", "Generator", "Transformer", "Capacitor"], answer: "Transformer", topic: "Equipment" },
                { id: "eee5", q: "Frequency of AC in India?", options: ["60 Hz", "50 Hz", "100 Hz", "120 Hz"], answer: "50 Hz", topic: "Standards" },
                { id: "eee6", q: "Which stores electrical energy?", options: ["Resistor", "Inductor", "Capacitor", "Transistor"], answer: "Capacitor", topic: "Components" },
                { id: "eee7", q: "Power factor is cosine of angle between?", options: ["Voltage & Time", "Voltage & Current", "Current & Time", "Real & Reactive Power"], answer: "Voltage & Current", topic: "AC Circuits" },
                { id: "eee8", q: "Unit of Resistance?", options: ["Ohm", "Farad", "Henry", "Tesla"], answer: "Ohm", topic: "Units" },
                { id: "eee9", q: "Generator converts?", options: ["Electrical to Mechanical", "Mechanical to Electrical", "Heat to Electrical", "AC to DC"], answer: "Mechanical to Electrical", topic: "Machines" },
                { id: "eee10", q: "Which limits fault current?", options: ["Relay", "Circuit Breaker", "Isolator", "Reactor"], answer: "Reactor", topic: "Protection" }
            ]},
            "Electrical Machines": { Beginner: [] },
            "Circuit Theory": { Beginner: [] },
            "Control Systems": { Beginner: [] },
            "Renewable Energy": { Beginner: [] },
            "High Voltage Engineering": { Beginner: [] }
        },
        ME: {
            "Thermodynamics": { Beginner: [
                { id: "me1", q: "First law of thermodynamics?", options: ["Energy Conservation", "Entropy", "Mass", "Force"], answer: "Energy Conservation", topic: "Laws" },
                { id: "me2", q: "Unit of pressure?", options: ["Newton", "Joule", "Pascal", "Watt"], answer: "Pascal", topic: "Properties" },
                { id: "me3", q: "Process with constant temperature?", options: ["Isobaric", "Isochoric", "Isothermal", "Adiabatic"], answer: "Isothermal", topic: "Processes" },
                { id: "me4", q: "Heat flows naturally from?", options: ["Cold to Hot", "Hot to Cold", "Low to High Pressure", "Vacuum to Gas"], answer: "Hot to Cold", topic: "Basics" },
                { id: "me5", q: "Measure of disorder?", options: ["Enthalpy", "Entropy", "Internal Energy", "Work"], answer: "Entropy", topic: "Properties" },
                { id: "me6", q: "Ideal gas equation?", options: ["PV=mRT", "P=V/T", "PT=VR", "V=PT"], answer: "PV=mRT", topic: "Laws" },
                { id: "me7", q: "Process with constant volume?", options: ["Isobaric", "Isochoric", "Isothermal", "Adiabatic"], answer: "Isochoric", topic: "Processes" },
                { id: "me8", q: "Second law of thermodynamics introduces?", options: ["Energy", "Work", "Entropy", "Mass"], answer: "Entropy", topic: "Laws" },
                { id: "me9", q: "Carnot cycle efficiency depends on?", options: ["Working fluid", "Pressure", "Temperatures", "Volume"], answer: "Temperatures", topic: "Cycles" },
                { id: "me10", q: "What is an open system?", options: ["Exchanges mass & energy", "No energy exchange", "No mass exchange", "Isolated"], answer: "Exchanges mass & energy", topic: "Systems" }
            ]},
            "Fluid Mechanics": { Beginner: [] },
            "Machine Design": { Beginner: [] },
            "Manufacturing Processes": { Beginner: [] },
            "Heat Transfer": { Beginner: [] },
            "Internal Combustion Engines": { Beginner: [] }
        },
        Civil: {
            "Structural Analysis": { Beginner: [
                { id: "ce1", q: "What bears a load horizontally?", options: ["Column", "Beam", "Wall", "Footing"], answer: "Beam", topic: "Components" },
                { id: "ce2", q: "Unit of stress?", options: ["N/m", "N/m²", "kg/m", "N"], answer: "N/m²", topic: "Mechanics" },
                { id: "ce3", q: "Ratio of lateral strain to linear strain?", options: ["Young's Modulus", "Poisson's Ratio", "Shear Modulus", "Bulk Modulus"], answer: "Poisson's Ratio", topic: "Properties" },
                { id: "ce4", q: "A simply supported beam has supports at?", options: ["One end", "Both ends", "Middle", "Cantilevered"], answer: "Both ends", topic: "Beams" },
                { id: "ce5", q: "Concrete is strong in?", options: ["Tension", "Compression", "Torsion", "Shear"], answer: "Compression", topic: "Materials" },
                { id: "ce6", q: "Hooke's Law holds up to?", options: ["Yield point", "Failure", "Proportional limit", "Plastic limit"], answer: "Proportional limit", topic: "Laws" },
                { id: "ce7", q: "Bending moment at a pin support?", options: ["Maximum", "Minimum", "Zero", "Depends on load"], answer: "Zero", topic: "Analysis" },
                { id: "ce8", q: "A vertical load bearing member?", options: ["Beam", "Column", "Slab", "Truss"], answer: "Column", topic: "Components" },
                { id: "ce9", q: "Yield strength defines?", options: ["Breaking point", "Onset of plastic deformation", "Elastic limit", "Density"], answer: "Onset of plastic deformation", topic: "Properties" },
                { id: "ce10", q: "Steel is added to concrete for?", options: ["Compression", "Color", "Tension", "Weight"], answer: "Tension", topic: "Materials" }
            ]},
            "Geotechnical Engineering": { Beginner: [] },
            "Transportation Engineering": { Beginner: [] },
            "Environmental Engineering": { Beginner: [] },
            "Surveying": { Beginner: [] },
            "Fluid Mechanics (Civil)": { Beginner: [] }
        }
    },
    Aptitude: {
        Quantitative: () => {
            const qs = [];
            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            
            // 1. Percentage
            const p = rand(2, 19) * 5; const v = rand(10, 100) * 10; const a1 = (p * v) / 100;
            qs.push({ id: `q1_${Date.now()}`, q: `What is ${p}% of ${v}?`, options: [`${a1}`, `${a1+10}`, `${a1-10}`, `${a1+20}`].sort(()=>Math.random()-0.5), answer: `${a1}`, topic: "Percentages" });

            // 2. Time & Work
            const w1 = rand(2,5)*2; const d1 = rand(3,8)*2; const w2 = w1*2; const a2 = (w1 * d1) / w2;
            qs.push({ id: `q2_${Date.now()}`, q: `If ${w1} workers take ${d1} days to complete a job, how many days will ${w2} workers take?`, options: [`${a2}`, `${a2+2}`, `${a2-1}`, `${a2+4}`].sort(()=>Math.random()-0.5), answer: `${a2}`, topic: "Time & Work" });

            // 3. Simple Interest
            const P = rand(1, 10) * 1000; const R = rand(3, 12); const T = rand(2, 5); const a3 = (P * R * T) / 100;
            qs.push({ id: `q3_${Date.now()}`, q: `What is the simple interest on Rs. ${P} at ${R}% per annum for ${T} years?`, options: [`${a3}`, `${a3+50}`, `${a3-50}`, `${a3+100}`].sort(()=>Math.random()-0.5), answer: `${a3}`, topic: "Interest" });

            // 4. Speed & Distance
            const s = rand(30, 80); const h = rand(2, 6); const a4 = s * h;
            qs.push({ id: `q4_${Date.now()}`, q: `A car travels at ${s} km/hr for ${h} hours. What is the total distance covered?`, options: [`${a4} km`, `${a4+20} km`, `${a4-10} km`, `${a4+40} km`].sort(()=>Math.random()-0.5), answer: `${a4} km`, topic: "Distance" });

            // 5. Algebra
            const ansX = rand(3, 12); const ax = rand(2, 5); const bx = rand(5, 20); const cx = ax * ansX + bx;
            qs.push({ id: `q5_${Date.now()}`, q: `If ${ax}x + ${bx} = ${cx}, find the value of x.`, options: [`${ansX}`, `${ansX+1}`, `${ansX-1}`, `${ansX+3}`].sort(()=>Math.random()-0.5), answer: `${ansX}`, topic: "Algebra" });

            // 6. LCM
            const l1 = rand(2, 5)*2; const l2 = l1 * rand(2, 3); const a6 = l2;
            qs.push({ id: `q6_${Date.now()}`, q: `What is the LCM of ${l1} and ${l2}?`, options: [`${a6}`, `${a6/2}`, `${a6*2}`, `${a6+2}`].sort(()=>Math.random()-0.5), answer: `${a6}`, topic: "Numbers" });

            // 7. Averages
            let av1 = rand(10, 40); let av2 = rand(10, 40); let av3 = rand(10, 40);
            av3 -= (av1+av2+av3)%3; // force divisible
            const a7 = (av1+av2+av3)/3;
            qs.push({ id: `q7_${Date.now()}`, q: `Find the average of ${av1}, ${av2}, and ${av3}.`, options: [`${a7}`, `${a7+1}`, `${a7-2}`, `${a7+5}`].sort(()=>Math.random()-0.5), answer: `${a7}`, topic: "Averages" });

            // 8. Geometry
            const gl = rand(10, 30); const gw = rand(5, 20); const a8 = gl * gw;
            qs.push({ id: `q8_${Date.now()}`, q: `Area of a rectangle with length ${gl}m and width ${gw}m?`, options: [`${a8} sq m`, `${a8+10} sq m`, `${a8-5} sq m`, `${a8+20} sq m`].sort(()=>Math.random()-0.5), answer: `${a8} sq m`, topic: "Geometry" });

            // 9. Profit & Loss
            const cp = rand(10, 50) * 10; const gain = rand(1, 4) * 10; const sp = cp + (cp * gain / 100);
            qs.push({ id: `q9_${Date.now()}`, q: `If cost price is Rs ${cp} and selling price is Rs ${sp}, what is the profit percentage?`, options: [`${gain}%`, `${gain+5}%`, `${gain-5}%`, `${gain+10}%`].sort(()=>Math.random()-0.5), answer: `${gain}%`, topic: "Profit & Loss" });

            // 10. Math
            const bases = [2, 3, 4, 5]; const base = bases[rand(0,3)]; const exp = rand(2, 4); const a10 = Math.pow(base, exp);
            qs.push({ id: `q10_${Date.now()}`, q: `Evaluate ${base}^${exp}.`, options: [`${a10}`, `${a10+1}`, `${a10-2}`, `${a10*2}`].sort(()=>Math.random()-0.5), answer: `${a10}`, topic: "Math" });

            return qs;
        },
        Logical: () => {
            const qs = [];
            const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
            
            // 1. Arithmetic Series
            const start1 = rand(2, 10); const step1 = rand(2, 6);
            const a1 = start1 + (step1 * 4);
            qs.push({ id: `l1_${Date.now()}`, q: `Series: ${start1}, ${start1+step1}, ${start1+step1*2}, ${start1+step1*3}, ?`, options: [`${a1}`, `${a1+1}`, `${a1-2}`, `${a1+step1}`].sort(()=>Math.random()-0.5), answer: `${a1}`, topic: "Series" });

            // 2. Geometric Series
            const start2 = rand(2, 5); const mult = rand(2, 3);
            const a2 = start2 * Math.pow(mult, 4);
            qs.push({ id: `l2_${Date.now()}`, q: `Series: ${start2}, ${start2*mult}, ${start2*mult*mult}, ${start2*Math.pow(mult, 3)}, ?`, options: [`${a2}`, `${a2+start2}`, `${a2/2}`, `${a2*2}`].sort(()=>Math.random()-0.5), answer: `${a2}`, topic: "Series" });

            // 3. Coding
            const shift = rand(1, 5);
            qs.push({ id: `l3_${Date.now()}`, q: `In a certain code, if A=${1+shift}, B=${2+shift}, then what is D?`, options: [`${4+shift}`, `${5+shift}`, `${3+shift}`, `${6+shift}`].sort(()=>Math.random()-0.5), answer: `${4+shift}`, topic: "Coding" });

            // 4. Syllogism
            const sys = ["Apples", "Cats", "Cars", "Pens"];
            const t = sys[rand(0,3)];
            qs.push({ id: `l4_${Date.now()}`, q: `All ${t} are blue. No blue things are soft. Therefore:`, options: [`No ${t} are soft`, `Some ${t} are soft`, `All soft things are ${t}`, `None`].sort(()=>Math.random()-0.5), answer: `No ${t} are soft`, topic: "Syllogism" });

            // 5. Direction
            const dist = rand(5, 20);
            qs.push({ id: `l5_${Date.now()}`, q: `Walk ${dist}m North, ${dist}m East, ${dist}m South. How far are you from the start?`, options: [`${dist}m`, `0m`, `${dist*2}m`, `${dist*3}m`].sort(()=>Math.random()-0.5), answer: `${dist}m`, topic: "Direction" });

            // 6. Calendars
            const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            const startDayIdx = rand(0, 4);
            const addDays = rand(2, 5);
            const targetDay = days[(startDayIdx + addDays) % 7];
            qs.push({ id: `l6_${Date.now()}`, q: `If today is ${days[startDayIdx]}, what day will it be in ${addDays} days?`, options: [targetDay, days[(startDayIdx+addDays+1)%7], days[(startDayIdx+addDays+2)%7], days[(startDayIdx+addDays-1+7)%7]].sort(()=>Math.random()-0.5), answer: targetDay, topic: "Calendars" });

            // 7. Word relations
            const pairs = [["Hot : Cold", "Up : Down", "Up : Sky"], ["Doctor : Hospital", "Teacher : School", "Teacher : Student"], ["Bird : Fly", "Fish : Swim", "Fish : Water"]];
            const p = pairs[rand(0,2)];
            qs.push({ id: `l7_${Date.now()}`, q: `Find the analogy matching -> ${p[0]} :: ?`, options: [p[1], p[2], "Car : Drive", "Tree : Green"].sort(()=>Math.random()-0.5), answer: p[1], topic: "Analogy" });

            // 8. Odd one out
            const odds = [["2, 4, 6, 9", "9"], ["10, 20, 30, 35", "35"], ["Tiger, Lion, Panther, Dog", "Dog"]];
            const o = odds[rand(0,2)];
            qs.push({ id: `l8_${Date.now()}`, q: `Find the odd one out: ${o[0]}`, options: [o[1], o[0].split(",")[0].trim(), o[0].split(",")[1].trim(), "None"].sort(()=>Math.random()-0.5), answer: o[1], topic: "Classification" });

            // 9. Ages
            const ageA = rand(10, 20); const ageB = ageA + rand(2, 5);
            qs.push({ id: `l9_${Date.now()}`, q: `A is ${ageA} years old. B is ${ageB - ageA} years older than A. What is B's age?`, options: [`${ageB}`, `${ageB+2}`, `${ageB-1}`, `${ageB+3}`].sort(()=>Math.random()-0.5), answer: `${ageB}`, topic: "Ages" });

            // 10. Blood Relations
            qs.push({ id: `l10_${Date.now()}`, q: `A is B's sister. C is B's mother. D is C's father. How is A related to D?`, options: ["Granddaughter", "Daughter", "Grandmother", "Aunt"], answer: "Granddaughter", topic: "Blood Relations" });

            return qs;
        }
    },
    Communication: {
        Grammar: [
            { id: "c1", q: "Correct: 'He don't know' or 'He doesn't know'?", options: ["don't", "doesn't", "not", "knowing not"], answer: "doesn't", topic: "Grammar" },
            { id: "c2", q: "Antonym of benevolent?", options: ["kind", "generous", "malevolent", "charitable"], answer: "malevolent", topic: "Vocab" },
            { id: "c3", q: "Synonym of happy?", options: ["sad", "angry", "joyful", "tired"], answer: "joyful", topic: "Vocab" },
            { id: "c4", q: "Plural of child?", options: ["childs", "children", "childrens", "childes"], answer: "children", topic: "Grammar" },
            { id: "c5", q: "What is the past tense of 'go'?", options: ["goed", "went", "gone", "going"], answer: "went", topic: "Grammar" },
            { id: "c6", q: "Choose the correct spelling:", options: ["acommodate", "acomodate", "accommodate", "acccommodate"], answer: "accommodate", topic: "Spelling" },
            { id: "c7", q: "I have been working ___ morning.", options: ["since", "for", "from", "to"], answer: "since", topic: "Prepositions" },
            { id: "c8", q: "He is good ___ math.", options: ["in", "at", "with", "on"], answer: "at", topic: "Prepositions" },
            { id: "c9", q: "Neither John ___ Peter is here.", options: ["or", "and", "nor", "but"], answer: "nor", topic: "Conjunctions" },
            { id: "c10", q: "Choose the correct article: ___ honor.", options: ["a", "an", "the", "no article"], answer: "an", topic: "Articles" },
            { id: "c11", q: "She ___ to the store yesterday.", options: ["go", "goes", "went", "going"], answer: "went", topic: "Tenses" },
            { id: "c12", q: "Synonym of abundant?", options: ["scarce", "plentiful", "rare", "few"], answer: "plentiful", topic: "Vocab" },
            { id: "c13", q: "Antonym of opaque?", options: ["cloudy", "solid", "transparent", "dark"], answer: "transparent", topic: "Vocab" },
            { id: "c14", q: "The book is ___ the table.", options: ["in", "on", "at", "into"], answer: "on", topic: "Prepositions" },
            { id: "c15", q: "Choose correctly spelled word:", options: ["embarrass", "embarass", "embaress", "embbarass"], answer: "embarrass", topic: "Spelling" },
            { id: "c16", q: "He plays football, ___ he?", options: ["don't", "isn't", "doesn't", "didn't"], answer: "doesn't", topic: "Tags" },
            { id: "c17", q: "I would rather you ___ home now.", options: ["go", "went", "going", "gone"], answer: "went", topic: "Grammar" },
            { id: "c18", q: "One who knows many languages is a?", options: ["Linguist", "Polyglot", "Bilingual", "Interpreter"], answer: "Polyglot", topic: "Vocab" },
            { id: "c19", q: "If I ___ a bird, I would fly.", options: ["was", "were", "am", "is"], answer: "were", topic: "Grammar" },
            { id: "c20", q: "We must abide ___ the rules.", options: ["by", "with", "to", "in"], answer: "by", topic: "Prepositions" }
        ]
    }
};
