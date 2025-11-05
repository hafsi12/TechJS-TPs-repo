"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = exports.BookFormat = exports.BookStatus = void 0;
var BookStatus;
(function (BookStatus) {
    BookStatus["READ"] = "Read";
    BookStatus["REREAD"] = "Re-read";
    BookStatus["DNF"] = "DNF";
    BookStatus["CURRENTLY_READING"] = "Currently reading";
    BookStatus["RETURNED_UNREAD"] = "Returned Unread";
    BookStatus["WANT_TO_READ"] = "Want to read";
})(BookStatus || (exports.BookStatus = BookStatus = {}));
var BookFormat;
(function (BookFormat) {
    BookFormat["PRINT"] = "Print";
    BookFormat["PDF"] = "PDF";
    BookFormat["EBOOK"] = "Ebook";
    BookFormat["AUDIOBOOK"] = "AudioBook";
})(BookFormat || (exports.BookFormat = BookFormat = {}));
class Book {
    constructor(title, author, totalPages, status = BookStatus.WANT_TO_READ, price = 0, pagesRead = 0, format = BookFormat.PRINT, suggestedBy = "") {
        this.title = title;
        this.author = author;
        this.totalPages = totalPages;
        this.status = status;
        this.price = price;
        this.pagesRead = pagesRead;
        this.format = format;
        this.suggestedBy = suggestedBy;
        this.finished = this.calculateFinishedStatus(pagesRead, totalPages);
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    // Méthode pour calculer le pourcentage de lecture
    currentlyAt() {
        if (this.totalPages === 0)
            return 0;
        return Math.round((this.pagesRead / this.totalPages) * 100);
    }
    // Méthode pour mettre à jour les pages lues
    updatePagesRead(pagesRead) {
        this.pagesRead = Math.min(pagesRead, this.totalPages);
        this.finished = this.calculateFinishedStatus(this.pagesRead, this.totalPages);
        if (this.finished && this.status !== BookStatus.READ && this.status !== BookStatus.REREAD) {
            this.status = BookStatus.READ;
        }
        this.updatedAt = new Date();
    }
    // Méthode pour calculer si le livre est terminé
    calculateFinishedStatus(pagesRead, totalPages) {
        return pagesRead >= totalPages;
    }
    // Méthode statique pour créer un livre depuis un objet
    static fromObject(obj) {
        const book = new Book(obj.title, obj.author, obj.totalPages, obj.status, obj.price, obj.pagesRead, obj.format, obj.suggestedBy);
        book._id = obj._id;
        book.finished = obj.finished;
        book.createdAt = obj.createdAt ? new Date(obj.createdAt) : new Date();
        book.updatedAt = obj.updatedAt ? new Date(obj.updatedAt) : new Date();
        return book;
    }
}
exports.Book = Book;
//# sourceMappingURL=Book.js.map