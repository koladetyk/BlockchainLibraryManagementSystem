
import { ethers } from 'ethers';
import { Modal, Button, Form, Card, Image } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Library from './artifacts/contracts/Library.sol/Library.json'

function App() {
  const [books, setBooks] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [bookData, setBookData] = useState({
      title: '',
      copies: ''
  });


  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS

  const ABI = Library.abi;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, ABI, provider);

  const fetchBooks = async () => {
    try {
        // Request account access 
        await provider.send("eth_requestAccounts", []);

        const signer = provider.getSigner();  
        const contractWithSigner = contract.connect(signer);
        
        const availableBooks = await contractWithSigner.getAvailableBooks();

        const booksFormatted = availableBooks.map(book => ({
          id: book.id.toNumber(),
          title: book.title
        }));
        
      

        console.log("availableBooks " + availableBooks); // content of availableBooks
        setBooks(booksFormatted);
    } catch (error) {
        console.error('Error fetching books:', error);
    }
  };


  // Fetch books on component mount
  useEffect(() => {
    if (window.ethereum) {
        fetchBooks();
    }
  }, []);

  //for modals
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal1 = () => setShowModal1(true);
  const handleCloseModal1 = () => setShowModal1(false);
  const handleShowModal2 = () => setShowModal2(true);
  const handleCloseModal2 = () => setShowModal2(false);


  const handleChange = (e) => {
      const { name, value } = e.target;
      //updates state based on previous value
      setBookData(prevState => ({
          ...prevState,
          [name]: value
      }));
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      try {
          const signer = provider.getSigner();
          const contractWithSigner = contract.connect(signer);
          //add book
          const tx = await contractWithSigner.addBook(bookData.title, parseInt(bookData.copies));
          await tx.wait(); // Wait for the transaction 
          fetchBooks(); // Refresh the book list
          handleCloseModal();
      } catch (error) {
          console.error('Error adding book:', error);
      }
  };

  //for borrowing books
  async function handleBorrow(id) {
    try {
      const signer = provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      //borrow book
      const tx = await contractWithSigner.borrowBook(parseInt(id));
      await tx.wait(); // Wait for the transaction 
      fetchBooks(); // Refresh the book list
      handleCloseModal1();
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  //const handleSubmit1 = async (e) => {
  //  e.preventDefault();
  //  try {
  //      const signer = provider.getSigner();
  //      const contractWithSigner = contract.connect(signer);
  //     const tx = await contractWithSigner.borrowBook(parseInt(bookData.id));
  //      await tx.wait(); // Wait for the transaction 
  //      fetchBooks(); // Refresh the book list
  //      handleCloseModal1();
  //  } catch (error) {
  //      console.error('Error borrowing book:', error);
  //  }
  //};

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    try {
        const signer = provider.getSigner();
        const contractWithSigner = contract.connect(signer);
        // return book
        const tx = await contractWithSigner.returnBook(parseInt(bookData.id));
        await tx.wait(); // Wait for the transaction 
        fetchBooks(); // Refresh the book list
        handleCloseModal2();
    } catch (error) {
        console.error('Error returning book:', error);
    }
  };


  

  return (
    <div className='container'>
       <Button variant='primary' onClick={handleShowModal}>Add Book</Button>
        <Modal show={showModal} onHide={handleCloseModal}>
          {/* Modal for adding book */}
            <Modal.Header closeButton>
                <Modal.Title>Add a New Book</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="formBookTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            name="title"
                            value={bookData.title}
                            onChange={handleChange}
                            placeholder="Enter book title"
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBookCopies">
                        <Form.Label>Copies</Form.Label>
                        <Form.Control
                            type="number"
                            name="copies"
                            value={bookData.copies}
                            onChange={handleChange}
                            placeholder="Number of copies"
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
        <Button variant='primary' onClick={handleShowModal2}>Return Book</Button>
        <Modal show={showModal2} onHide={handleCloseModal2}>
          {/* Modal for returning book */}
            <Modal.Header closeButton>
                <Modal.Title>Return Book</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit2}>
                    <Form.Group className="mb-3" controlId="formBookTitle">
                        <Form.Label>ID</Form.Label>
                        <Form.Control
                            type="number"
                            name="id"
                            value={bookData.id}
                            onChange={handleChange}
                            placeholder="Enter book id"
                            required
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
        <Button variant='outline-secondary' size='sm' onClick={fetchBooks}>
            Fetch Available Books
        </Button>
        <h2 className="mt-4">Available Books</h2>
        <div>
          {/* for showing available books */}
          {books.map((book, index) => (
            <Card key={index} style={{ width: '32rem' }} className='mt-3 mb-3 shadow bg-body rounded'>
            <Card.Body>
              <Card.Title>{book.title}</Card.Title>
              <Card.Text>
                Book id: {book.id}
              </Card.Text>
              <Button variant="info" className="me-2" onClick={() => handleBorrow(book.id)}>Borrow</Button>
            </Card.Body>
          </Card>
          
          ))}
        </div>

    </div>
  );

}

export default App;
