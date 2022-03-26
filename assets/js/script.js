const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', ()=>{
    const submitBookAction = document.getElementById('inputBook');

    submitBookAction.addEventListener('submit', function(event){
        event.preventDefault(); 
        const dataId = this.querySelector('#submitBook').dataset.id;
        addBook(dataId);
    });

    const searchBookAction = document.getElementById('searchBook');
    searchBookAction.addEventListener('keyup', function(event){
        event.preventDefault();
        searchBook();
    });
    searchBookAction.addEventListener('search', function(event){
        event.preventDefault();
        searchBook();
    });

    const resetForm = document.getElementById('resetFormBook');
    resetForm.addEventListener('click', ()=>{
        clearForm();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }
    
});

function searchBook(){
    const searchBookTitle = document.getElementById('searchBookTitle').value;
    const allListBook = document.querySelector('#allBookList');
    const bookSearch = books.filter( book => book.title.toLowerCase().includes(searchBookTitle.toLowerCase()) );
    allListBook.innerHTML = '';
    for(bookItem of bookSearch){
        const bookElement = makeBook(bookItem);
        allBookList.append(bookElement);
    }
}

function addBook(idBook = ''){
    const titleBook = document.getElementById('titleBook').value;
    const authorBook = document.getElementById('authorBook').value;
    const yearBook = parseInt(document.getElementById('yearBook').value);
    let bookIsComplete = document.getElementById('bookIsComplete').value;
    const bookIsCompleteCheck = document.getElementById('bookIsComplete').checked;
    let indexBuku = books.length;
    
    books.forEach((book, index) => {
        if(book.id == idBook){
            indexBuku = index;
        }
    })
    
    if(bookIsCompleteCheck){
        bookIsComplete = true;
    }else{
        bookIsComplete = false;
    }

    if(indexBuku != books.length){
        const bookObject = generateBookObject(idBook, titleBook, authorBook, yearBook, bookIsComplete)
        books.splice(indexBuku, 1, bookObject);
        Swal.fire("Success", "Berhasil menyimpan perubahan", "success").then(()=>{
            document.dispatchEvent(new Event(RENDER_EVENT));
        }).then(() => saveData());
        
    } else {

        const generateID = generateId();
        const bookObject = generateBookObject(generateID, titleBook, authorBook, yearBook, bookIsComplete);
        books.push(bookObject);
        if(bookIsComplete == true){
            Swal.fire("Success", "Berhasil ditambahkan ke rak selesai dibaca", "success").then(()=>{
                document.dispatchEvent(new Event(RENDER_EVENT));
            }).then(() => saveData());
        }else if(bookIsComplete == false){
            Swal.fire("Success", "Berhasil ditambahkan ke rak belum selesai dibaca", "success").then(()=>{
                saveData();
                document.dispatchEvent(new Event(RENDER_EVENT));
            });
        }
        
        
    }

};

function generateId(){
    return +new Date();
};

function generateBookObject(id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
};

document.addEventListener(RENDER_EVENT, ()=>{
    

    for(bookItem of books){
        const bookElement = makeBook(bookItem);
        allBookList.append(bookElement);
    }

    for(bookItem of books){
        const bookElement = makeBook(bookItem);
        allBookList.append(bookElement);
        if(bookItem.isComplete == false)
            incompleteBookList.append(bookElement);
        else
            completeBookList.append(bookElement);
    }
});

function makeBook(bookObject){
    const textTitleBook = document.createElement('p');
    textTitleBook.innerHTML = `<i class="fa fa-book"></i>&nbsp; : ${bookObject.title}`;
    const textAuthorBook = document.createElement('p');
    textAuthorBook.innerHTML = `<i class="fa fa-user-check"></i> : ${bookObject.author}`;
    const textYearBook = document.createElement('p');
    textYearBook.innerHTML = `<i class="fa fa-calendar"></i>&nbsp; : ${bookObject.year}`;
    const textStatus = document.createElement('p');
    
    const buttonUpdateBook = document.createElement('button');
    buttonUpdateBook.innerHTML = '<i class="fa fa-pencil"></i>';
    buttonUpdateBook.classList.add('warning', 'ml-5')
    buttonUpdateBook.dataset.idBuku = bookObject.id;

    if(bookObject.isComplete){
        textStatus.classList.add('success');
        textStatus.innerText = 'Status : Telah selesai dibaca';
    }else{
        textStatus.classList.add('warning');
        textStatus.innerText = 'Status : Belum selesai dibaca'
    }

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitleBook, textAuthorBook, textYearBook, textStatus);
    
    const container = document.createElement('article');
    container.classList.add('book-item', 'shadow');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if(bookObject.isComplete){
        const undoButton = document.createElement('button');
        undoButton.innerHTML = '<i class="fa fa-rotate-left"></i>';
        undoButton.classList.add('primary');
        undoButton.addEventListener('click', ()=>{
            Swal.fire({
                title: `Yakin memindahkan buku berjudul ${bookObject.title}?`,
                text: "Kamu akan memindahkan buku ke rak belum selesai dibaca!",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Pindahkan!',
                cancelButtonText: 'Batalkan',
              }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("Success", "Berhasil dipindahkan ke rak belum selesai dibaca", "success")
                    .then(()=> {
                        undoBookFromCompleted(bookObject.id);
                    });
                }
              });
            
        });
        
        const trashButton = document.createElement('button');
        trashButton.innerHTML = '<i class="fa fa-trash"></i>';
        trashButton.classList.add('danger', 'ml-5');
        trashButton.addEventListener('click', ()=>{
            Swal.fire({
                title: `Yakin menghapus buku berjudul ${bookObject.title}?`,
                text: "Kamu tidak akan bisa mengembalikan lagi jika terhapus!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batalkan'
              }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("Success", "Berhasil terhapus", "success")
                    .then(()=> {
                        removeBook(bookObject.id);
                    });
                }
              });
        });

        buttonUpdateBook.addEventListener('click', function(){
            Swal.fire({
                title: `Yakin memperbarui buku berjudul ${bookObject.title}?`,
                text: "Kamu akan memperbarui buku yang nantinya bisa diperbarui lagi! Cek form untuk mengubahnya",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Perbarui!',
                cancelButtonText: 'Batalkan'
              }).then((result) => {
                if (result.isConfirmed) {                       
                    setBookForm(this.dataset.idBuku);             
                }
              });
        });
        
        container.append(undoButton, buttonUpdateBook, trashButton);
    }else{
        const completeButton = document.createElement('button');
        completeButton.innerHTML = '<i class="fa fa-check-to-slot"></i>';
        completeButton.classList.add('primary');
        completeButton.addEventListener('click', ()=>{
            Swal.fire({
                title: `Yakin memindahkan buku berjudul ${bookObject.title}?`,
                text: "Kamu akan memindahkan buku ke rak selesai dibaca!",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Pindahkan!',
                cancelButtonText: 'Batalkan'
              }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("Success", "Berhasil dipindahkan ke rak selesai dibaca", "success")
                    .then(()=> {
                        addBookToCompleted(bookObject.id);
                    });
                }  
              });
            
        });

        const trashButton = document.createElement('button');
        trashButton.innerHTML = '<i class="fa fa-trash"></i>';
        trashButton.classList.add('danger', 'ml-5');
        trashButton.addEventListener('click', ()=>{
            Swal.fire({
                title: `Yakin menghapus buku berjudul ${bookObject.title}?`,
                text: "Kamu tidak akan bisa mengembalikan lagi jika terhapus!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Hapus!',
                cancelButtonText: 'Batalkan'
              }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("Success", "Berhasil menghapus buku", "success")
                    .then(()=> {
                        removeBook(bookObject.id);
                    });
                }
              });
            
        });

        buttonUpdateBook.addEventListener('click', function(){
            Swal.fire({
                title: `Yakin memperbarui buku berjudul ${bookObject.title}?`,
                text: "Kamu akan memperbarui buku yang nantinya bisa diperbarui lagi! Cek form untuk mengubahnya",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Perbarui!',
                cancelButtonText: 'Batalkan'
              }).then((result) => {
                if (result.isConfirmed) {                                  
                    setBookForm(this.dataset.idBuku);          
                }
              });
        })
        container.append(completeButton, buttonUpdateBook, trashButton);
    }
    return container;
};

function setBookForm(data){
    let bookItem = books.filter( book => book.id == data);
    document.querySelector('#titleBook').value = bookItem[0].title;
    document.querySelector('#authorBook').value = bookItem[0].author;
    document.querySelector('#yearBook').value = bookItem[0].year;
    document.querySelector('#submitBook').dataset.id = bookItem[0].id;

    if(bookItem[0].isComplete){
        document.querySelector('#bookIsComplete').checked = true;
    } else {
        document.querySelector('#bookIsComplete').checked = false;
    }
}

function addBookToCompleted(bookId){
    const bookTarget = findBook(bookId);
    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
};

function findBook(bookId){
    for(bookItem of books){
        if(bookItem.id === bookId){
            return bookItem;
        }
    }
    return null;
};

function removeBook(bookId){
    const bookTarget = findBookIndex(bookId);
    if(bookTarget === -1) return;
    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
};

function undoBookFromCompleted(bookId){
    const bookTarget = findBook(bookId);
        if(bookTarget == null) return;
    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId){
    for(index in books){
        if(books[index].id === bookId){
            return index;
        }
    }
    return -1;
};

const STORAGE_KEY = "BOOK_APPS";

function saveData(){
    if(isStorageExist){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
    document.querySelector('#titleBook').value = '';
    document.querySelector('#authorBook').value = '';
    document.querySelector('#yearBook').value = '';
    document.querySelector('#submitBook').dataset.id = '';
    document.getElementById('bookIsComplete').checked = false;
    location.reload();
};

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser kamu tidak mendukung web storage");
        return false;
    }
    return true;
};


function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if(data !== null){
        for (let book of data){
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    
}

function clearForm(){
    document.querySelector('#titleBook').value = '';
    document.querySelector('#authorBook').value = '';
    document.querySelector('#yearBook').value = '';
    document.querySelector('#submitBook').dataset.id = '';
    document.getElementById('bookIsComplete').checked = false;
}