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
// import { Author } from './models/Author';


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

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  // const [authors, setAuthors] = useState<Author[]>([]);
  const [booksBarChartData, setBooksBarChartData] = useState<ChartData<"bar">>();
  // const [authorsBarChartData, setAuthorsBarChartData] = useState<ChartData<"bar">>();
  const [pieChartData, setPieChartData] = useState<ChartData<"pie">>();

  // Only one fetchBooks definition, and it matches json-server's array response
  const fetchBooks = async () => {
  try {
    const response = await fetch('/api/books');
    const books = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }

    setBooks(books);
  } catch (error) {
    console.log(error);
  }
};
  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (books) {
      const labels = books.map(book => book.title);
      const data = books.map(book => book.pages);

      setBooksBarChartData({
        labels,
        datasets: [
          {
            label: "Total Pages",
            data: data,
            backgroundColor: generateColors(data.length),
            borderColor: generateColors(data.length),
            borderWidth: 1,
          }
        ]
      })
    }
  }, [books]);

  useEffect(() => {
    if (books) {
      const authorBookCount = new Map();

      for (const book of books) {
        const authorName = book.name;

        if (authorBookCount.has(authorName)) {
          authorBookCount.set(authorName, authorBookCount.get(authorName) + 1);
        } else {
          authorBookCount.set(authorName, 1);
        }
      }

      const chartData = {
        labels: Array.from(authorBookCount.keys()),
        datasets: [
          {
            label: 'Book Count',
            data: Array.from(authorBookCount.values()),
            backgroundColor: generateColors(authorBookCount.size),
            borderColor: generateColors(authorBookCount.size),
            borderWidth: 1,
          },
        ],
      };

      setPieChartData(chartData);
    }
  }, [books])

  function generateColors(numColors: number) {
    const colors = [];
    const colorPalette = ['#ff6384', '#38aecc', '#ffd700', '#4caf50', '#9c27b0'];
    for (let i = 0; i < numColors; i++) {
      colors.push(colorPalette[i % colorPalette.length]);
    }
    return colors;
  }

  // const fetchAuthors = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/authors`);
  //     const { authors, message } = await response.json();

  //     if (!response.ok) {
  //       throw new Error(message);
  //     }

  //     setAuthors(authors);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div className='h-screen font-mono p-4'>
      <header className='py-2 border-b'>
        <h1 className='text-center font-bold text-5xl'>Dashboard</h1>
      </header>
      <main className='py-4 px-4 space-y-6'>
        <div className='space-x-4'>
          <Button type='primary' size='large' className='rounded-none'>
            <Link to={`books`}>Books</Link>
          </Button>
          <Button type='primary' size='large' className='rounded-none'>
            <Link to={`authors`}>Authors</Link>
          </Button>
        </div>
        <div className='p-12 flex justify-between' style={{ height: "100%"}}>
          <div>
            {pieChartData && <Pie width={500} data={pieChartData} />}
          </div>
          <div>
            {booksBarChartData && (<Bar style={{
              display: "block", boxSizing: "border-box", height: "500px", width: "900px"
            }} width={1800} height={900} options={barChartOptions} data={booksBarChartData} />)}
          </div>
          {/* <div>
            {authorsBarChartData && (<Bar width={700} options={barChartOptions} data={authorsBarChartData} />)}
          </div> */}
        </div>
      </main>
    </div>
  )
}

export default App