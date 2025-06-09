/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'antd'
import './App.css'
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { Book } from './models/Books';
import { Author } from './models/Author'; // <-- Uncommented this import

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Book Length Distribution'
    },
  },
  scales: {
    y: {
      min: 150,
      max: 700,
      ticks: {
        stepSize: 10
      }
    }
  }
};

// Define the API Base URL from the environment variable
// The exact way Vite/SWA exposes env variables starting REACT_APP_ is import.meta.env.REACT_APP_...
// The error indicates this might be undefined - let's log its value to be sure
const API_BASE_URL = import.meta.env.REACT_APP_API_URL;


function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]); // <-- Uncommented this state
  const [booksBarChartData, setBooksBarChartData] = useState<ChartData<"bar">>();
  const [authorsBarChartData, setAuthorsBarChartData] = useState<ChartData<"bar">>(); // <-- Uncommented this state
  const [pieChartData, setPieChartData] = useState<ChartData<"pie">>();

  // Only one fetchBooks definition, and it matches json-server's array response
  const fetchBooks = async () => {
  try {
    // Old relative path call (commented out)
    //const response = await fetch('/api/books');

    // Add console log to see the value of the URL we are about to use
    console.log("Attempting to fetch books from:", `${API_BASE_URL}/api/books`);

    // Use the API_BASE_URL constant
    const response = await fetch(`${API_BASE_URL}/api/books`); // Uses the backend URL from config
    const books = await response.json();

    if (!response.ok) {
      // Log the response details if fetching failed
      console.error(`Failed to fetch books: Status ${response.status}`, await response.text());
      throw new Error(`Failed to fetch books (status: ${response.status})`);
    }

    setBooks(books);
  } catch (error) {
    console.error("Error fetching books:", error); // Changed log to console.error
  }
};

  // Fetch Authors function (Uncommented and corrected URL)
  const fetchAuthors = async () => {
    try {
      // Add console log to see the value of the URL we are about to use
      console.log("Attempting to fetch authors from:", `${API_BASE_URL}/api/authors`);

      // Use the API_BASE_URL constant
      const response = await fetch(`${API_BASE_URL}/api/authors`);
      // Check response status before trying to parse JSON
       if (!response.ok) {
         console.error(`Failed to fetch authors: Status ${response.status}`, await response.text());
         throw new Error(`Failed to fetch authors (status: ${response.status})`);
       }
      // Your backend JSON structure might differ from the commented out code's expectation { authors, message }
      // Assuming the backend returns an array of authors directly now:
      const authors = await response.json();


      setAuthors(authors); // Assuming the backend returns an array of authors
    } catch (error) {
      console.error("Error fetching authors:", error); // Changed log to console.error
    }
  };


  // useEffect to fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // useEffect to fetch authors on component mount
  useEffect(() => { // <-- Uncommented this useEffect
    fetchAuthors();
  }, []); // <-- Add fetchAuthors to dependencies if it uses outside state, [] means run once


  // useEffect to prepare Book Length Bar Chart data
  useEffect(() => {
    // Check if books data exists before processing
    if (books && books.length > 0) { // <-- Added check for books array not being empty
      const labels = books.map(book => book.title);
      const data = books.map(book => book.pages);

      setBooksBarChartData({
        labels,
        datasets: [
          {
            label: "Total Pages",
            data: data,
            backgroundColor: generateColors(data.length), // Make sure generateColors exists
            borderColor: generateColors(data.length),     // and is accessible
            borderWidth: 1,
          }
        ]
      });
    } else {
         setBooksBarChartData(undefined); // Reset chart data if books are empty/null
    }
  }, [books]); // <-- Dependency is 'books' state

  // useEffect to prepare Author Book Count Pie Chart data
  useEffect(() => {
    // Check if books data exists before processing
    if (books && books.length > 0) { // <-- Added check for books array not being empty
      const authorBookCount = new Map();

      for (const book of books) {
        // Assuming book.name is the author name. Confirm your book model field.
        const authorName = book.name; // <-- CONFIRM this maps to author name in your book object

        if (authorBookCount.has(authorName)) {
          authorBookCount.set(authorName, authorBookCount.get(authorName) + 1);
        } else {
          authorBookCount.set(authorName, 1);
        }
      }

      const chartData = {
        labels: Array.from(authorBookCount.keys()), // Author names as labels
        datasets: [
          {
            label: 'Book Count',
            data: Array.from(authorBookCount.values()), // Count of books per author
            backgroundColor: generateColors(authorBookCount.size),
            borderColor: generateColors(authorBookCount.size),
            borderWidth: 1,
          },
        ],
      };

      setPieChartData(chartData);
    } else {
        setPieChartData(undefined); // Reset chart data if books are empty/null
    }
  }, [books]); // <-- Dependency is 'books' state

  // Function to generate colors (already present, keeping it)
  function generateColors(numColors: number) {
    const colors = [];
    const colorPalette = ['#ff6384', '#38aecc', '#ffd700', '#4caf50', '#9c27b0'];
    for (let i = 0; i < numColors; i++) {
      colors.push(colorPalette[i % colorPalette.length]);
    }
    return colors;
  }

  // useEffect to prepare Authors Bar Chart data (Uncommented and corrected logic)
  useEffect(() => { // <-- Uncommented this useEffect
     if (authors && authors.length > 0) { // <-- Added check for authors array not being empty
       // Assuming your author object has 'name' and some metric for the bar chart
       // You might need to adapt this based on your actual Author model structure and chart goal
       const labels = authors.map(author => author.name); // Assuming Author model has 'name' field
       const data = authors.map(author => 0); // Placeholder data - adjust based on actual chart requirement

       setAuthorsBarChartData({
         labels,
         datasets: [
           {
             label: "Author Data", // Change label as needed
             data: data, // Populate with actual data from authors if charting authors specific metric
             backgroundColor: generateColors(data.length),
             borderColor: generateColors(data.length),
             borderWidth: 1,
           }
         ]
       });
     } else {
        setAuthorsBarChartData(undefined); // Reset chart data if authors are empty/null
     }
   }, [authors]); // <-- Dependency is 'authors' state

  return (
    <div className='h-screen font-mono p-4'>
      <header className='py-2 border-b'>
        <h1 className='text-center font-bold text-5xl'>Dashboard</h1>
      </header>
      <main className='py-4 px-4 space-y-6'>
        <div className='space-x-4'>
          <Button type='primary' size='large' className='rounded-none'>
            {/* Using React Router Link, adjust 'to' paths based on your AppRouter setup */}
            <Link to={`/books`}>Books</Link>
          </Button>
          <Button type='primary' size='large' className='rounded-none'>
             {/* Using React Router Link, adjust 'to' paths based on your AppRouter setup */}
            <Link to={`/authors`}>Authors</Link>
          </Button>
           {/* Assuming you have Add buttons leading to specific routes */}
            <Button type='default' size='large' className='rounded-none'>
              <Link to="/addbook">Add Book</Link> {/* Assuming route '/addbook' exists */}
            </Button>
        </div>
        <div className='p-12 flex justify-between' style={{ height: "100%"}}>
          <div>
            {/* Render Pie chart for Authors (based on book count by author) */}
            {pieChartData ? (
              <Pie width={500} data={pieChartData} />
            ) : (
               <div>No Pie Chart Data (likely no books)</div> // Placeholder
            )}
          </div>
          <div>
            {/* Render Bar chart for Books Length */}
            {booksBarChartData ? (
               <Bar style={{
                display: "block", boxSizing: "border-box", height: "500px", width: "900px"
              }} width={1800} height={900} options={barChartOptions} data={booksBarChartData} />
            ) : (
               <div>No Book Length Chart Data (likely no books)</div> // Placeholder
            )}
          </div>
          {/* Uncomment and adapt if you have a separate authors chart based on authors data */}
          {/* <div>
            {authorsBarChartData ? (
              <Bar width={700} options={barChartOptions} data={authorsBarChartData} />
            ) : (
               <div>No Authors Chart Data (fetchAuthors might be commented out or returned no data)</div> // Placeholder
            )}
          </div> */}
        </div>
        {/* You might also have table rendering code here or in linked components (BooksPage.tsx, AuthorsPage.tsx) */}
        {/* Display books in a list/table (based on your other frontend files like BooksPage.tsx) */}
         <h2>Books List</h2>
         {books && books.length > 0 ? (
            <ul>
              {books.map(book => (
                 <li key={book.id}>{book.title} by {book.name} ({book.pages} pages)</li>
              ))}
           </ul>
         ) : (
           <p>No book data available. Check API or add books.</p>
         )}

        {/* Display authors in a list/table (based on your other frontend files like AuthorsPage.tsx) */}
         <h2>Authors List</h2>
         {authors && authors.length > 0 ? (
            <ul>
              {authors.map(author => (
                 <li key={author.id}>{author.name}</li> {/* Assuming Author model has 'id' and 'name' */}
              ))}
           </ul>
         ) : (
           <p>No author data available. Check API or authors fetch logic.</p>
         )}

      </main>
    </div>
  )
}

export default App;
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Button } from 'antd'
// import './App.css'
// import { Link } from 'react-router-dom';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ChartData,
//   ArcElement
// } from 'chart.js';
// import { Bar, Pie } from 'react-chartjs-2';
// import { useEffect, useState } from 'react';
// import { Book } from './models/Books';
// // import { Author } from './models/Author';


// ChartJS.register(
//   ArcElement,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// );

// const barChartOptions = {
//   responsive: true,
//   plugins: {
//     legend: {
//       position: 'top' as const,
//     },
//     title: {
//       display: true,
//       text: 'Book Length Distribution'
//     },
//   },
//   scales: {
//     y: {
//       min: 150,
//       max: 700,
//       ticks: {
//         stepSize: 10
//       }
//     }
//   }
// };

// function App() {
//   const [books, setBooks] = useState<Book[]>([]);
//   // const [authors, setAuthors] = useState<Author[]>([]);
//   const [booksBarChartData, setBooksBarChartData] = useState<ChartData<"bar">>();
//   // const [authorsBarChartData, setAuthorsBarChartData] = useState<ChartData<"bar">>();
//   const [pieChartData, setPieChartData] = useState<ChartData<"pie">>();

//   // Only one fetchBooks definition, and it matches json-server's array response
//   const fetchBooks = async () => {
//   try {
//     //const response = await fetch('/api/books');
//     //
//     const response = await fetch(`${import.meta.env.REACT_APP_API_URL}/api/books`); // Uses the backend URL from config
//     const books = await response.json();

//     if (!response.ok) {
//       throw new Error('Failed to fetch books');
//     }

//     setBooks(books);
//   } catch (error) {
//     console.log(error);
//   }
// };
//   useEffect(() => {
//     fetchBooks();
//   }, []);

//   useEffect(() => {
//     if (books) {
//       const labels = books.map(book => book.title);
//       const data = books.map(book => book.pages);

//       setBooksBarChartData({
//         labels,
//         datasets: [
//           {
//             label: "Total Pages",
//             data: data,
//             backgroundColor: generateColors(data.length),
//             borderColor: generateColors(data.length),
//             borderWidth: 1,
//           }
//         ]
//       })
//     }
//   }, [books]);

//   useEffect(() => {
//     if (books) {
//       const authorBookCount = new Map();

//       for (const book of books) {
//         const authorName = book.name;

//         if (authorBookCount.has(authorName)) {
//           authorBookCount.set(authorName, authorBookCount.get(authorName) + 1);
//         } else {
//           authorBookCount.set(authorName, 1);
//         }
//       }

//       const chartData = {
//         labels: Array.from(authorBookCount.keys()),
//         datasets: [
//           {
//             label: 'Book Count',
//             data: Array.from(authorBookCount.values()),
//             backgroundColor: generateColors(authorBookCount.size),
//             borderColor: generateColors(authorBookCount.size),
//             borderWidth: 1,
//           },
//         ],
//       };

//       setPieChartData(chartData);
//     }
//   }, [books])

//   function generateColors(numColors: number) {
//     const colors = [];
//     const colorPalette = ['#ff6384', '#38aecc', '#ffd700', '#4caf50', '#9c27b0'];
//     for (let i = 0; i < numColors; i++) {
//       colors.push(colorPalette[i % colorPalette.length]);
//     }
//     return colors;
//   }
   
//   // const fetchAuthors = async () => {
//   //   try {
//   //     const response = await fetch(`${API_URL}/authors`);
//   //     const { authors, message } = await response.json();

//   //     if (!response.ok) {
//   //       throw new Error(message);
//   //     }

//   //     setAuthors(authors);
//   //   } catch (error) {
//   //     console.log(error);
//   //   }
//   // };

//   return (
//     <div className='h-screen font-mono p-4'>
//       <header className='py-2 border-b'>
//         <h1 className='text-center font-bold text-5xl'>Dashboard</h1>
//       </header>
//       <main className='py-4 px-4 space-y-6'>
//         <div className='space-x-4'>
//           <Button type='primary' size='large' className='rounded-none'>
//             <Link to={`books`}>Books</Link>
//           </Button>
//           <Button type='primary' size='large' className='rounded-none'>
//             <Link to={`authors`}>Authors</Link>
//           </Button>
//         </div>
//         <div className='p-12 flex justify-between' style={{ height: "100%"}}>
//           <div>
//             {pieChartData && <Pie width={500} data={pieChartData} />}
//           </div>
//           <div>
//             {booksBarChartData && (<Bar style={{
//               display: "block", boxSizing: "border-box", height: "500px", width: "900px"
//             }} width={1800} height={900} options={barChartOptions} data={booksBarChartData} />)}
//           </div>
//           {/* <div>
//             {authorsBarChartData && (<Bar width={700} options={barChartOptions} data={authorsBarChartData} />)}
//           </div> */}
//         </div>
//       </main>
//     </div>
//   )
// }

// export default App