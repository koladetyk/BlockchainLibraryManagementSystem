// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

contract Ownable {
    address public owner;

    modifier onlyOwner() {
        require(owner == msg.sender, "Contract not invoked by the owner.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }
}

contract Library is Ownable {
    struct Book {
        string title;
        uint256 copies;
        address[] borrowers;
    }

    Book[] private books;

    //added copies 
    struct AvailableBook {
        uint256 id;
        string title;
    }

    // Events
    event NewBookAdded(uint256 id, string title);
    event NewCopiesAdded(uint256 id, uint256 copies);
    event BookBorrowed(uint256 indexed id, address borrower);
    event BookReturned(uint256 id, address borrower);

    // Modifier
    modifier bookMustExist(uint256 _id) {
        require(books.length > 0, "The library has no books currently.");
        require(_id <= books.length - 1, "Book with this ID does not exist in the collection.");
        _;
    }

    function addBook(string calldata _title, uint256 _copies) public onlyOwner {
        require(_copies > 0, "Add at least one copy of the book.");
        for (uint256 i = 0; i < books.length; i++) {
            if (keccak256(abi.encodePacked(books[i].title)) == keccak256(abi.encodePacked(_title))) {
                // If book already exists in the library, increase number of copies
                books[i].copies += _copies;
                emit NewCopiesAdded(i, _copies);
                return;
            }
        }
        // If book does not exist in the collection, add it
        books.push();
        books[books.length - 1].title = _title;
        books[books.length - 1].copies = _copies;
        emit NewBookAdded(books.length - 1, _title);
    }

    function getAvailableBooks() public view returns (AvailableBook[] memory) {
        // Get number of available book titles
        // This is due to the fact that memory arrays have to be fixed-sized
        uint256 counter = 0;
        for (uint256 i = 0; i < books.length; i++) {
            if (books[i].copies > books[i].borrowers.length) {
                counter++;
            }
        }
        // Retrieve available books

        AvailableBook[] memory availableBooks = new AvailableBook[](counter);

        counter = 0;

        for (uint256 i = 0; i < books.length; i++) {

            if (books[i].copies - books[i].borrowers.length > 0) {

            availableBooks[counter] = AvailableBook(i, books[i].title);

            counter++;

            }

        }

        return availableBooks;
    }

    function _hasBook(uint256 _id, address _user) private view returns (bool) {

        for (uint256 i = 0; i < books[_id].borrowers.length; i++) {

            if (_user == books[_id].borrowers[i]) {

            return true;

            }   

        }

        return false;

    }

    function borrowBook(uint256 _id) public bookMustExist(_id) {
        require(!_hasBook(_id, msg.sender), "Book must be returned before it can be borrowed.");
        require(books[_id].copies > books[_id].borrowers.length, "There are no copies of the book available.");
        // Borrow this book
        books[_id].borrowers.push(msg.sender);
        emit BookBorrowed(_id, msg.sender);
    }

    function returnBook(uint256 _id) public bookMustExist(_id) {
        require(_hasBook(_id, msg.sender), "You do not have this book on loan.");
        for (uint256 i = 0; i < books[_id].borrowers.length; i++) {
            if (msg.sender == books[_id].borrowers[i]) {
                _removeIndexFromAddressArray(books[_id].borrowers, i);
                emit BookReturned(_id, msg.sender);
                return;
            }
        }
    }

    function _removeIndexFromAddressArray(address[] storage _array, uint256 _index) private {
        _array[_index] = _array[_array.length - 1];
        _array.pop();
    }
}
