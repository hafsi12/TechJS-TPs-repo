import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/booktracker';

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques depuis src/public
app.use(express.static(path.join(__dirname, 'public')));

// Enumérations
enum BookStatus {
    READ = "Read",
    REREAD = "Re-read",
    DNF = "DNF",
    CURRENTLY_READING = "Currently reading",
    RETURNED_UNREAD = "Returned Unread",
    WANT_TO_READ = "Want to read"
}

enum BookFormat {
    PRINT = "Print",
    PDF = "PDF",
    EBOOK = "Ebook",
    AUDIOBOOK = "AudioBook"
}

// Interface Book
interface IBook {
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

// Schéma Mongoose
const bookSchema = new mongoose.Schema<IBook>({
    title: { type: String, required: true },
    author: { type: String, required: true },
    totalPages: { type: Number, required: true, min: 1 },
    status: {
        type: String,
        enum: Object.values(BookStatus),
        default: BookStatus.WANT_TO_READ
    },
    price: { type: Number, default: 0, min: 0 },
    pagesRead: { type: Number, default: 0, min: 0 },
    format: {
        type: String,
        enum: Object.values(BookFormat),
        default: BookFormat.PRINT
    },
    suggestedBy: { type: String, default: '' },
    finished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour updatedAt
bookSchema.pre('save', function(next) {
    this.updatedAt = new Date();

    // Calcul automatique du statut finished
    if (this.pagesRead >= this.totalPages) {
        this.finished = true;
        if (this.status !== BookStatus.READ && this.status !== BookStatus.REREAD) {
            this.status = BookStatus.READ;
        }
    } else {
        this.finished = false;
    }

    next();
});

const BookModel = mongoose.model<IBook>('Book', bookSchema);

// Connexion MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connecté à MongoDB'))
    .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes API
app.get('/api/books', async (req, res) => {
    try {
        const books = await BookModel.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des livres' });
    }
});

app.post('/api/books', async (req, res) => {
    try {
        const bookData: IBook = req.body;

        // Validation des données
        if (!bookData.title || !bookData.author || !bookData.totalPages) {
            return res.status(400).json({ error: 'Titre, auteur et nombre de pages sont requis' });
        }

        const book = new BookModel(bookData);
        await book.save();

        res.status(201).json(book);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la création du livre' });
    }
});

app.patch('/api/books/:id/pages', async (req, res) => {
    try {
        const { id } = req.params;
        const { pagesRead } = req.body;

        if (!pagesRead && pagesRead !== 0) {
            return res.status(400).json({ error: 'Le nombre de pages lues est requis' });
        }

        const book = await BookModel.findById(id);
        if (!book) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        book.pagesRead = Math.min(pagesRead, book.totalPages);
        await book.save();

        res.json(book);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour des pages' });
    }
});

app.delete('/api/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await BookModel.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ error: 'Livre non trouvé' });
        }

        res.json({ message: 'Livre supprimé avec succès' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du livre' });
    }
});

app.get('/api/stats', async (req, res) => {
    try {
        const totalBooks = await BookModel.countDocuments();
        const finishedBooks = await BookModel.countDocuments({ finished: true });

        const pagesResult = await BookModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalPagesRead: { $sum: '$pagesRead' }
                }
            }
        ]);

        const totalPagesRead = pagesResult[0]?.totalPagesRead || 0;

        res.json({
            totalBooks,
            finishedBooks,
            totalPagesRead
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
    }
});

// Route pour servir l'application
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`Accédez à l'application sur: http://localhost:${PORT}`);
});