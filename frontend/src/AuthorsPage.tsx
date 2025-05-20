import { Alert, Button, Table } from 'antd'
import './App.css'
import { useEffect, useState } from 'react'
import { IconEdit } from './components/IconEdit';
import { IconDelete } from './components/IconDelete';
import { IconView } from './components/IconView';
import { Link } from 'react-router-dom';
import { Author } from './models/Author';
import { AddEditAuthorModal } from './components/AddEditAuthorModal';
import { ViewAuthorModal } from './components/ViewAuthorModal';
import { DeleteAuthorModal } from './components/DeleteAuthorModal';

const columns = [
   {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
   {
      title: 'Author',
      dataIndex: 'name',
      key: 'name',
   },
   {
      title: 'Birthday',
      dataIndex: 'birthday',
      key: 'birthday',
   },
   {
      title: 'Description',
      dataIndex: 'bio',
      key: 'bio',
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
   }
];

function AuthorsPage() {
   const [authors, setAuthors] = useState<Author[]>([]);
   const [dataSource, setDataSource] = useState<Author[]>([]);
   const [activeAuthor, setActiveAuthor] = useState<Author>();
   const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
   const [isErrorAlertVisible, setIsErrorAlertVisible] = useState(false);
   const [message, setMessage] = useState('');
   const [isEdit, setIsEdit] = useState(false);

   useEffect(() => {
      fetchAuthors();
   }, [])

   useEffect(() => {
      formatAuthorsForDisplay(authors);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [authors])

   const fetchAuthors = async () => {
      try {
         const response = await fetch('/api/authors');
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
               // Assuming the backend returns an array of authors directly or an object like { authors: [] }
               const parsedResponse = JSON.parse(responseText);
               const fetchedAuthors = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.authors;
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

   const editAuthor = async (authorData: Author) => {
      try {
         if (activeAuthor) {
            const response = await fetch(`/api/authors/${activeAuthor.id}`, {
               method: 'PUT',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(authorData),
            });
            const responseText = await response.text();

            if (!response.ok) {
               let errorMsg = `Failed to update author (status: ${response.status} ${response.statusText})`;
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
            
            let successMsg = 'Author updated successfully';
            if (responseText) {
               try {
                  // Assuming backend might return { message: "...", author: {} } or { message: "...", authors: [] }
                  const parsedResponse = JSON.parse(responseText);
                  if(parsedResponse.message) successMsg = parsedResponse.message;
                  // If backend returns updated list of all authors
                  if (parsedResponse.authors) setAuthors(parsedResponse.authors);
                  // If backend returns just the updated author, you might merge it or refetch
                  // else if (parsedResponse.author) {
                  //    setAuthors(prev => prev.map(a => a.id === parsedResponse.author.id ? parsedResponse.author : a));
                  // } 
                  else {
                     fetchAuthors(); // Default to refetching
                  }
               } catch (e) {
                  console.warn("editAuthor: Response was OK but not valid JSON. Refetching authors.", responseText.substring(0,200));
                  fetchAuthors();
               }
            } else {
               fetchAuthors(); // If response is empty but OK
            }

            setMessage(successMsg);
            setIsSuccessAlertVisible(true);
            setTimeout(() => setIsSuccessAlertVisible(false), 5000);
         }
      } catch (error) {
         console.error("Error in editAuthor:", error);
         setMessage((error as Error).message);
         setIsErrorAlertVisible(true);
         setTimeout(() => setIsErrorAlertVisible(false), 5000);
      }
   }

   const addAuthor = async (authorData: Omit<Author, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
         const response = await fetch('/api/authors', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(authorData),
         });
         const responseText = await response.text();

         if (!response.ok) {
            let errorMsg = `Failed to add author (status: ${response.status} ${response.statusText})`;
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

         let successMsg = 'Author added successfully';
         if (responseText) {
            try {
               const parsedResponse = JSON.parse(responseText);
               if(parsedResponse.message) successMsg = parsedResponse.message;
                // If backend returns updated list of all authors
               if (parsedResponse.authors) setAuthors(parsedResponse.authors);
               // If backend returns just the new author
               // else if (parsedResponse.author) {
               //    setAuthors(prev => [...prev, parsedResponse.author]);
               // } 
               else {
                  fetchAuthors(); // Default to refetching
               }
            } catch (e) {
               console.warn("addAuthor: Response was OK but not valid JSON. Refetching authors.", responseText.substring(0,200));
               fetchAuthors();
            }
         } else {
            fetchAuthors(); // If response is empty but OK
         }
         
         setMessage(successMsg);
         setIsSuccessAlertVisible(true);
         setTimeout(() => setIsSuccessAlertVisible(false), 5000);
      } catch (error) {
         console.error("Error in addAuthor:",error);
         setMessage((error as Error).message);
         setIsErrorAlertVisible(true);
         setTimeout(() => setIsErrorAlertVisible(false), 5000);
      }
   }

   const authorAddEdit = (authorData: Author | Omit<Author, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (isEdit && 'id' in authorData) { // Check if it's a full Author object for editing
         editAuthor(authorData as Author);
      } else if (!isEdit) {
         addAuthor(authorData as Omit<Author, 'id' | 'createdAt' | 'updatedAt'>);
      }
   }

   const authorDelete = async () => {
      try {
         if (activeAuthor) {
            const response = await fetch(`/api/authors/${activeAuthor.id}`, {
               method: 'DELETE',
               headers: {
                  'Content-Type': 'application/json',
               }
            });
            const responseText = await response.text(); // Read text even for DELETE

            if (!response.ok) {
               let errorMsg = `Failed to delete author (status: ${response.status} ${response.statusText})`;
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
            
            // json-server usually returns empty body for DELETE (204 No Content)
            // Other backends might return a message or the updated list
            let successMsg = 'Author deleted successfully';
            if(responseText){
               try {
                  const parsed = JSON.parse(responseText);
                  if(parsed.message) successMsg = parsed.message;
                  if(parsed.authors) setAuthors(parsed.authors);
                  else fetchAuthors();
               } catch(e){
                  // If responseText is not empty but not JSON, still refetch
                  fetchAuthors();
               }
            } else {
               fetchAuthors();
            }
            
            setMessage(successMsg);
            setIsSuccessAlertVisible(true);
            setTimeout(() => setIsSuccessAlertVisible(false), 5000);
         }
      } catch (error) {
         console.error("Error in authorDelete:", error);
         setMessage((error as Error).message);
         setIsErrorAlertVisible(true);
         setTimeout(() => setIsErrorAlertVisible(false), 5000);
      }
   }

   const handleAuthorAdd = () => {
      setActiveAuthor(undefined);
      setIsEdit(false);
      setIsAddEditModalOpen(true);
   }

   const handleAuthorEdit = (author: Author) => {
      setActiveAuthor(author);
      setIsEdit(true);
      setIsAddEditModalOpen(true);
   }

   const handleAuthorView = (author: Author) => {
      setActiveAuthor(author);
      setIsViewModalOpen(true);
   }

   const handleAuthorDelete = (author: Author) => {
      setActiveAuthor(author);
      setIsDeleteModalOpen(true);
   }

   const formatAuthorsForDisplay = (authorsToFormat: Author[]) => {
      if (authorsToFormat && authorsToFormat.length >= 0) {
         const newDataSource = authorsToFormat.map(author => ({
            ...author,
            key: author.id,
            birthday: author.birthday ? new Date(author.birthday).toLocaleDateString() : 'N/A',
            createdAt: author.createdAt ? new Date(author.createdAt).toLocaleString() : 'N/A',
            updatedAt: author.updatedAt ? new Date(author.updatedAt).toLocaleString() : 'N/A',
            actions: (
               <div className='flex space-x-4'>
                  <Button icon={<IconEdit />} onClick={() => handleAuthorEdit(author)} />
                  <Button type='primary' icon={<IconView />} onClick={() => handleAuthorView(author)} />
                  <Button type='primary' icon={<IconDelete />} danger onClick={() => handleAuthorDelete(author)} />
               </div>
            )
         }));
         setDataSource(newDataSource);
      } else {
         setDataSource([]);
      }
   }

   return (
      <div className='h-screen font-mono p-4'>
         <header className='relative py-2 border-b'>
            <Button size='large' className='rounded-none absolute'>
               <Link to={`/`}>⬅️ Dashboard</Link>
            </Button>
            <h1 className='text-center font-bold text-5xl'>MANAGE AUTHORS</h1>
         </header>
         <main className='py-4 px-4 space-y-6'>
            <div className='flex justify-between items-start'>
               <Button type='primary' size='large' className='rounded-none' onClick={handleAuthorAdd}>
                  <span className='font-bold'>+</span>&nbsp; Add Author
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
         <AddEditAuthorModal 
            initialValues={activeAuthor} 
            isEdit={isEdit} 
            isModalOpen={isAddEditModalOpen} 
            setIsModalOpen={setIsAddEditModalOpen} 
            onOk={authorAddEdit} 
         />
         <ViewAuthorModal 
            author={activeAuthor} 
            isModalOpen={isViewModalOpen} 
            setIsModalOpen={setIsViewModalOpen} 
         />
         <DeleteAuthorModal 
            author={activeAuthor} 
            isModalOpen={isDeleteModalOpen} 
            setIsModalOpen={setIsDeleteModalOpen} 
            onOk={authorDelete} 
         />
      </div>
   )
}

export default AuthorsPage