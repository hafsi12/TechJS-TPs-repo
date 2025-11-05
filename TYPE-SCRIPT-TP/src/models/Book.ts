export enum BookStatus {
    READ = "Read",
    REREAD = "Re-read",
    DNF = "DNF",
    CURRENTLY_READING = "Currently reading",
    RETURNED_UNREAD = "Returned Unread",
    WANT_TO_READ = "Want to read"
}

export enum BookFormat {
    PRINT = "Print",
    PDF = "PDF",
    EBOOK = "Ebook",
    AUDIOBOOK = "AudioBook"
}

export interface IBook {
    _id?: string;
    title: string;
    author: string;
    totalPages: number;
    status: BookStatus;
    price: number;
    pagesRead: number;
    format: BookFormat;
    suggestedBy?: string;
    finished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class Book implements IBook {
    _id?: string;
    title: string;
    author: string;
    totalPages: number;
    status: BookStatus;
    price: number;
    pagesRead: number;
    format: BookFormat;
    suggestedBy?: string;
    finished: boolean;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(
        title: string,
        author: string,
        totalPages: number,
        status: BookStatus = BookStatus.WANT_TO_READ,
        price: number = 0,
        pagesRead: number = 0,
        format: BookFormat = BookFormat.PRINT,
        suggestedBy: string = ""
    ) {
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
    currentlyAt(): number {
        if (this.totalPages === 0) return 0;
        return Math.round((this.pagesRead / this.totalPages) * 100);
    }

    // Méthode pour mettre à jour les pages lues
    updatePagesRead(pagesRead: number): void {
        this.pagesRead = Math.min(pagesRead, this.totalPages);
        this.finished = this.calculateFinishedStatus(this.pagesRead, this.totalPages);

        if (this.finished && this.status !== BookStatus.READ && this.status !== BookStatus.REREAD) {
            this.status = BookStatus.READ;
        }

        this.updatedAt = new Date();
    }

    // Méthode pour calculer si le livre est terminé
    private calculateFinishedStatus(pagesRead: number, totalPages: number): boolean {
        return pagesRead >= totalPages;
    }

    // Méthode statique pour créer un livre depuis un objet
    static fromObject(obj: any): Book {
        const book = new Book(
            obj.title,
            obj.author,
            obj.totalPages,
            obj.status,
            obj.price,
            obj.pagesRead,
            obj.format,
            obj.suggestedBy
        );
        book._id = obj._id;
        book.finished = obj.finished;
        book.createdAt = obj.createdAt ? new Date(obj.createdAt) : new Date();
        book.updatedAt = obj.updatedAt ? new Date(obj.updatedAt) : new Date();
        return book;
    }
}