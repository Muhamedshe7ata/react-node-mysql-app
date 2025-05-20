// ...existing imports...
import { Alert, Button, Table } from 'antd'
import './App.css'
import { useEffect, useState } from 'react'
import { IconEdit } from './components/IconEdit';
import { IconDelete } from './components/IconDelete';
import { IconView } from './components/IconView';
import { Link } from 'react-router-dom';
import { AddEditBookModal } from './components/AddEditBookModal';
import { ViewBookModal } from './components/ViewBookModal';
import { DeleteBookModal } from './components/DeleteBookModal';
import { Book, BookDTO, BookFormDTO } from './models/Books';
import { Author } from './models/Author';
// const API_URL = import.meta.env.VITE_API_URL; // No longer needed if using relative paths for proxy

const columns = [
  // ...existing columns definition...
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Release Date',
    dataIndex: 'releaseDate',
    key: 'releaseDate',
  },
  {
    title: 'Author',
    dataIndex: 'author',
    key: 'author',
  },
  {
    title: 'Created Date',
    dataIndex: 'createdAt',
    key: 'createdAt',
  },
  {
    title: 'Updated Date',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
  },
];

function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  // ...existing state variables...
  const [dataSource, setDataSource] = useState<BookDTO[]>([]);
  const [activeBook, setActiveBook] = useState<Book>();
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchBooks();
    fetchAuthors();
  }, [])

  useEffect(() => {
    formatBooksForDisplay(books);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, authors])

  const fetchBooks = async () => {
    try {
      const response = await fetch(`/api/books`); // Use relative path for proxy
      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = `Failed to fetch books (status: ${response.status} ${response.statusText})`;
        if (responseText) {
          try {
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
              const errorJson = JSON.parse(responseText);
              errorMsg = errorJson.message || errorMsg;
            } else {
              errorMsg += ` - Server response: ${responseText.substring(0, 100)}`;
            }
          } catch (e) { 
            errorMsg += ` - Server response (parsing failed): ${responseText.substring(0, 100)}`;
          }
        }
        throw new Error(errorMsg);
      }

      if (responseText) {
        try { 
          const parsedResponse = JSON.parse(responseText);
          const fetchedBooks = parsedResponse.books || parsedResponse; 
          setBooks(Array.isArray(fetchedBooks) ? fetchedBooks : []);
        } catch (parseError) {
          const specificMessage = `Failed to parse book data. The server may have returned an unexpected format (e.g., HTML instead of JSON). Please check server logs and the API endpoint (/api/books). Content snippet: ${responseText.substring(0,150)}`;
          console.error("fetchBooks: Response was OK but not valid JSON.", {responseTextSnippet: responseText.substring(0,200), originalError: parseError});
          setMessage(specificMessage);
          setIsErrorAlertVisible(true);
          setBooks([]); 
          setTimeout(() => setIsErrorAlertVisible(false), 7000);
          return; 
        }
      } else {
        setBooks([]); 
      }

    } catch (error) { 
      console.error("Error in fetchBooks:", error);
      if (!isErrorAlertVisible) { 
        setMessage((error as Error).message);
        setIsErrorAlertVisible(true);
        setTimeout(() => setIsErrorAlertVisible(false), 5000);
      }
      setBooks([]); 
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch(`/api/authors`); // Use relative path for proxy
      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = `Failed to fetch authors (status: ${response.status} ${response.statusText})`;
        if (responseText) {
          try {
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
              const errorJson = JSON.parse(responseText);
              errorMsg = errorJson.message || errorMsg;
            } else {
              errorMsg += ` - Server response: ${responseText.substring(0, 100)}`;
            }
          } catch (e) { 
             errorMsg += ` - Server response (parsing failed): ${responseText.substring(0, 100)}`;
          }
        }
        throw new Error(errorMsg);
      }
      
      if (responseText) {
        try { 
          const parsedResponse = JSON.parse(responseText);
          const fetchedAuthors = parsedResponse.authors || parsedResponse; 
          setAuthors(Array.isArray(fetchedAuthors) ? fetchedAuthors : []);
        } catch (parseError) {
          const specificMessage = `Failed to parse author data. The server may have returned an unexpected format (e.g., HTML instead of JSON). Please check server logs and the API endpoint (/api/authors). Content snippet: ${responseText.substring(0,150)}`;
          console.error("fetchAuthors: Response was OK but not valid JSON.", {responseTextSnippet: responseText.substring(0,200), originalError: parseError});
          setMessage(specificMessage);
          setIsErrorAlertVisible(true);
          setAuthors([]); 
          setTimeout(() => setIsErrorAlertVisible(false), 7000);
          return; 
        }
      } else {
        setAuthors([]);
      }

    } catch (error) { 
      console.error("Error in fetchAuthors:", error);
      if (!isErrorAlertVisible) { 
         setMessage((error as Error).message);
         setIsErrorAlertVisible(true);
         setTimeout(() => setIsErrorAlertVisible(false), 5000);
      }
      setAuthors([]); 
    }
  };

  const editBook = async (bookData: BookFormDTO) => {
    try {
      if (activeBook) {
        const response = await fetch(`/api/books/${activeBook.id}`, { // Use relative path
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookData),
        });
        // ... rest of the function with existing error handling logic ...
        const responseText = await response.text();

        if (!response.ok) {
          let errorMsg = `Failed to update book (status: ${response.status} ${response.statusText})`;
          if (responseText) {
            try {
              if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                const errorJson = JSON.parse(responseText);
                errorMsg = errorJson.message || errorMsg;
              } else { errorMsg += ` - Server response: ${responseText.substring(0, 100)}`; }
            } catch (e) { errorMsg += ` - Server response (parsing failed): ${responseText.substring(0, 100)}`; }
          }
          throw new Error(errorMsg);
        }

        let successMsg = 'Book updated successfully.';
        if (responseText) {
          try {
            const { message: apiMessage, books: updatedBooks } = JSON.parse(responseText);
            if (apiMessage) successMsg = apiMessage;
            if (updatedBooks) setBooks(updatedBooks); 
            else fetchBooks(); 
          } catch (e) {
            console.warn("editBook: Response was OK but not valid JSON. Refetching books.", responseText.substring(0,200));
            fetchBooks(); 
          }
        } else {
          fetchBooks(); 
        }
        
        setMessage(successMsg);
        setIsSuccessAlertVisible(true);
        setTimeout(() => setIsSuccessAlertVisible(false), 5000);
      }
    } catch (error) {
      console.error("Error in editBook:", error);
      setMessage((error as Error).message);
      setIsErrorAlertVisible(true);
      setTimeout(() => setIsErrorAlertVisible(false), 5000);
    }
  }

  const addBook = async (bookData: BookFormDTO) => {
    try {
      const response = await fetch(`/api/books`, { // Use relative path
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      // ... rest of the function with existing error handling logic ...
      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = `Failed to add book (status: ${response.status} ${response.statusText})`;
        if (responseText) {
          try {
            if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
              const errorJson = JSON.parse(responseText);
              errorMsg = errorJson.message || errorMsg;
            } else { errorMsg += ` - Server response: ${responseText.substring(0, 100)}`; }
          } catch (e) { errorMsg += ` - Server response (parsing failed): ${responseText.substring(0, 100)}`; }
        }
        throw new Error(errorMsg);
      }
      
      let successMsg = 'Book added successfully.';
      if (responseText) {
        try {
          const { message: apiMessage, books: updatedBooks } = JSON.parse(responseText);
          if (apiMessage) successMsg = apiMessage;
          if (updatedBooks) setBooks(updatedBooks); 
          else fetchBooks(); 
        } catch (e) {
          console.warn("addBook: Response was OK but not valid JSON. Refetching books.", responseText.substring(0,200));
          fetchBooks(); 
        }
      } else {
        fetchBooks(); 
      }

      setMessage(successMsg);
      setIsSuccessAlertVisible(true);
      setTimeout(() => setIsSuccessAlertVisible(false), 5000);
    } catch (error) {
      console.error("Error in addBook:", error);
      setMessage((error as Error).message);
      setIsErrorAlertVisible(true);
      setTimeout(() => setIsErrorAlertVisible(false), 5000);
    }
  }

  const bookAddEdit = (book: BookFormDTO) => {
    if (isEdit) {
      editBook(book);
      return;
    }
    addBook(book);
  }

  const bookDelete = async () => {
    try {
      if (activeBook) {
        const response = await fetch(`/api/books/${activeBook.id}`, { // Use relative path
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        });
        // ... rest of the function with existing error handling logic ...
        const responseText = await response.text();

        if (!response.ok) {
          let errorMsg = `Failed to delete book (status: ${response.status} ${response.statusText})`;
          if (responseText) {
            try {
              if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
                const errorJson = JSON.parse(responseText);
                errorMsg = errorJson.message || errorMsg;
              } else { errorMsg += ` - Server response: ${responseText.substring(0, 100)}`; }
            } catch (e) { errorMsg += ` - Server response (parsing failed): ${responseText.substring(0, 100)}`; }
          }
          throw new Error(errorMsg);
        }

        let successMsg = 'Book deleted successfully.';
        if (responseText) { 
          try {
            const { message: apiMessage, books: updatedBooks } = JSON.parse(responseText);
            if (apiMessage) successMsg = apiMessage;
            if (updatedBooks) setBooks(updatedBooks);
            else fetchBooks(); 
          } catch (e) {
            console.warn("bookDelete: Response was OK but not valid JSON or empty. Refetching books.", responseText.substring(0,200));
            fetchBooks(); 
          }
        } else { 
           fetchBooks(); 
        }
        
        setMessage(successMsg);
        setIsSuccessAlertVisible(true);
        setTimeout(() => setIsSuccessAlertVisible(false), 5000);
      }
    } catch (error) {
      console.error("Error in bookDelete:", error);
      setMessage((error as Error).message);
      setIsErrorAlertVisible(true);
      setTimeout(() => setIsErrorAlertVisible(false), 5000);
    }
  }

  // ...existing handleBookAdd, handleBookEdit, etc. ...
  const handleBookAdd = () => {
    setActiveBook(undefined);
    setIsEdit(false);
    setIsAddEditModalOpen(true);
  }

  const handleBookEdit = (book: Book) => {
    setActiveBook(book);
    setIsEdit(true);
    setIsAddEditModalOpen(true);
  }

  const handleBookView = (book: Book) => {
    setActiveBook(book);
    setIsViewModalOpen(true);
  }

  const handleBookDelete = (book: Book) => {
    setActiveBook(book);
    setIsDeleteModalOpen(true);
  }

  const formatBooksForDisplay = (booksToFormat: Book[]) => {
    if (booksToFormat && booksToFormat.length >= 0) { 
      const newDataSource: BookDTO[] = booksToFormat.map(book => {
        const authorObj = authors.find(a => a.id === book.authorId);
        return {
          key: book.id,
          id: book.id,
          title: book.title,
          releaseDate: book.releaseDate ? new Date(book.releaseDate).toLocaleDateString() : 'N/A',
          description: book.description,
          pages: book.pages,
          author: authorObj?.name || `ID: ${book.authorId}`,
          createdAt: book.createdAt ? new Date(book.createdAt).toLocaleString() : 'N/A',
          updatedAt: book.updatedAt ? new Date(book.updatedAt).toLocaleString() : 'N/A',
          actions: (
            <div className='flex space-x-4'>
              <Button icon={<IconEdit />} onClick={() => handleBookEdit(book)} />
              <Button type='primary' icon={<IconView />} onClick={() => handleBookView(book)} />
              <Button type='primary' icon={<IconDelete />} danger onClick={() => handleBookDelete(book)} />
            </div>
          )
        };
      });
      setDataSource(newDataSource);
    } else {
      setDataSource([]); 
    }
  }
  // ...existing JSX return...
  return (
    <div className='h-screen font-mono p-4'>
      <header className='relative py-2 border-b'>
        <Button size='large' className='rounded-none absolute'>
          <Link to={`/`}>⬅️ Dashboard</Link>
        </Button>
        <h1 className='text-center font-bold text-5xl'>MANAGE BOOKS</h1>
      </header>
      <main className='py-4 px-4 space-y-6'>
        <div className='flex justify-between items-start'> 
          <Button type='primary' size='large' className='rounded-none' onClick={handleBookAdd}>
            <span className='font-bold'>+</span>&nbsp; Add Book
          </Button>
          <div className='flex flex-col space-y-2'> 
            {isSuccessAlertVisible && (
              <Alert
                message={message}
                type="success"
                showIcon
                closable
                onClose={() => setIsSuccessAlertVisible(false)}
              />
            )}
            {isErrorAlertVisible && (
              <Alert
                message={message}
                type="error"
                showIcon
                closable
                onClose={() => setIsErrorAlertVisible(false)}
              />
            )}
          </div>
        </div>
        <div>
          <Table dataSource={dataSource} columns={columns} size="middle" />
        </div>
      </main>
      <AddEditBookModal
        authors={authors}
        initialValues={activeBook && { ...activeBook, author: activeBook?.authorId }}
        isEdit={isEdit}
        isModalOpen={isAddEditModalOpen}
        setIsModalOpen={setIsAddEditModalOpen}
        onOk={bookAddEdit}
      />
      <ViewBookModal 
        book={activeBook && { 
          ...activeBook, 
          author: authors.find(a => a.id === activeBook.authorId)?.name || `ID: ${activeBook.authorId}` 
        }} 
        isModalOpen={isViewModalOpen} 
        setIsModalOpen={setIsViewModalOpen} 
      />
      <DeleteBookModal 
        book={activeBook} 
        isModalOpen={isDeleteModalOpen} 
        setIsModalOpen={setIsDeleteModalOpen} 
        onOk={bookDelete} 
      />
    </div>
  )
}

export default BooksPage