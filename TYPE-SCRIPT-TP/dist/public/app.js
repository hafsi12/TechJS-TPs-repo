class BookTrackerApp {
    constructor() {
        this.apiBaseUrl = window.location.origin + "/api";
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadBooks();
        await this.loadStats();
    }

    setupEventListeners() {
        const form = document.getElementById("bookForm");
        if (form) {
            console.log("Formulaire trouvé, ajout de l'event listener");
            form.addEventListener("submit", (e) => this.handleFormSubmit(e));
        } else {
            console.error("Formulaire non trouvé! Vérifiez l'ID 'bookForm'");
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        console.log("Formulaire soumis!");

        const form = e.target;

        // Méthode alternative: récupérer les valeurs directement par ID
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const totalPages = document.getElementById("totalPages").value;

        console.log("Valeurs directes - Titre:", title, "Auteur:", author, "Pages:", totalPages);

        // Validation simple
        if (!title || !author || !totalPages) {
            alert("Veuillez remplir tous les champs obligatoires");
            return;
        }

        const bookData = {
            title: title,
            author: author,
            totalPages: parseInt(totalPages),
            status: document.getElementById("status").value,
            price: parseFloat(document.getElementById("price").value) || 0,
            pagesRead: parseInt(document.getElementById("pagesRead").value) || 0,
            format: document.getElementById("format").value,
            suggestedBy: document.getElementById("suggestedBy").value || "",
            finished: false
        };

        console.log("Données préparées:", bookData);

        try {
            await this.addBook(bookData);
            form.reset();
            await this.loadBooks();
            await this.loadStats();
            alert("Livre ajouté avec succès!");
        } catch (error) {
            console.error("Erreur lors de l'ajout du livre:", error);
            alert("Erreur lors de l'ajout du livre: " + error.message);
        }
    }

    async addBook(bookData) {
        console.log("Envoi des données au serveur:", bookData);

        const response = await fetch(this.apiBaseUrl + "/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bookData),
        });

        console.log("Réponse du serveur:", response.status, response.statusText);

        if (!response.ok) {
            let errorMessage = "Erreur lors de l'ajout du livre";
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                console.error("Détails de l'erreur serveur:", errorData);
            } catch (e) {
                const errorText = await response.text();
                errorMessage = errorText || errorMessage;
                console.error("Erreur texte:", errorText);
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log("Livre ajouté avec succès:", result);
        return result;
    }

    async loadBooks() {
        try {
            console.log("Chargement des livres...");
            const response = await fetch(this.apiBaseUrl + "/books");
            if (!response.ok) throw new Error("Erreur HTTP: " + response.status);
            const books = await response.json();
            console.log("Livres chargés:", books);
            this.renderBooks(books);
        } catch (error) {
            console.error("Erreur lors du chargement des livres:", error);
        }
    }

    async loadStats() {
        try {
            console.log("Chargement des statistiques...");
            const response = await fetch(this.apiBaseUrl + "/stats");
            if (!response.ok) throw new Error("Erreur HTTP: " + response.status);
            const stats = await response.json();
            console.log("Statistiques chargées:", stats);
            this.renderStats(stats);
        } catch (error) {
            console.error("Erreur lors du chargement des statistiques:", error);
        }
    }

    renderBooks(books) {
        const container = document.getElementById("booksContainer");
        if (!container) {
            console.error("Container booksContainer non trouvé!");
            return;
        }

        if (books.length === 0) {
            container.innerHTML = "<p class='text-gray-500 text-center'>Aucun livre enregistré</p>";
            return;
        }

        console.log("Rendu de", books.length, "livres");
        let html = "";
        books.forEach(book => {
            const percentage = Math.round((book.pagesRead / book.totalPages) * 100);
            const statusColor = this.getStatusColor(book.status);
            const suggestedBy = book.suggestedBy ? "<div class='col-span-2'><strong>Suggéré par:</strong> " + this.escapeHtml(book.suggestedBy) + "</div>" : "";
            const finished = book.finished ? "<div class='col-span-2 text-green-600 font-semibold'>✓ Terminé</div>" : "";

            html += `
                <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h3 class="font-semibold text-lg">${this.escapeHtml(book.title)}</h3>
                            <p class="text-gray-600">par ${this.escapeHtml(book.author)}</p>
                        </div>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                            ${book.status}
                        </span>
                    </div>

                    <div class="mb-3">
                        <div class="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progression</span>
                            <span>${book.pagesRead}/${book.totalPages} pages (${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div><strong>Format:</strong> ${book.format}</div>
                        <div><strong>Prix:</strong> ${book.price ? book.price + "€" : "Gratuit"}</div>
                        ${suggestedBy}
                        ${finished}
                    </div>

                    <div class="mt-3 flex space-x-2">
                        <button onclick="bookTrackerApp.updatePages('${book._id}', ${book.pagesRead + 10})"
                                class="flex-1 bg-green-100 text-green-700 py-1 px-3 rounded text-sm hover:bg-green-200 transition-colors">
                            +10 pages
                        </button>
                        <button onclick="bookTrackerApp.deleteBook('${book._id}')"
                                class="flex-1 bg-red-100 text-red-700 py-1 px-3 rounded text-sm hover:bg-red-200 transition-colors">
                            Supprimer
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderStats(stats) {
        const container = document.getElementById("statsContainer");
        if (!container) {
            console.error("Container statsContainer non trouvé!");
            return;
        }

        container.innerHTML = `
            <div class="bg-blue-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-blue-600">${stats.totalBooks}</div>
                <div class="text-blue-800">Livres total</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-green-600">${stats.finishedBooks}</div>
                <div class="text-green-800">Livres terminés</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg text-center">
                <div class="text-2xl font-bold text-purple-600">${stats.totalPagesRead}</div>
                <div class="text-purple-800">Pages lues</div>
            </div>
        `;
    }

    getStatusColor(status) {
        const colors = {
            "Read": "bg-green-100 text-green-800",
            "Re-read": "bg-green-100 text-green-800",
            "Currently reading": "bg-blue-100 text-blue-800",
            "Want to read": "bg-yellow-100 text-yellow-800",
            "DNF": "bg-red-100 text-red-800",
            "Returned Unread": "bg-gray-100 text-gray-800"
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    }

    escapeHtml(unsafe) {
        if (!unsafe) return "";
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    async updatePages(bookId, newPages) {
        try {
            const response = await fetch(this.apiBaseUrl + "/books/" + bookId + "/pages", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pagesRead: newPages }),
            });

            if (response.ok) {
                await this.loadBooks();
                await this.loadStats();
            } else {
                const errorData = await response.json();
                alert("Erreur: " + (errorData.error || "Erreur lors de la mise à jour"));
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour des pages:", error);
            alert("Erreur lors de la mise à jour des pages");
        }
    }

    async deleteBook(bookId) {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
            return;
        }

        try {
            const response = await fetch(this.apiBaseUrl + "/books/" + bookId, {
                method: "DELETE",
            });

            if (response.ok) {
                await this.loadBooks();
                await this.loadStats();
            } else {
                const errorData = await response.json();
                alert("Erreur: " + (errorData.error || "Erreur lors de la suppression"));
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du livre:", error);
            alert("Erreur lors de la suppression du livre");
        }
    }
}

// Vérification que le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM chargé, initialisation de l'application");
        window.bookTrackerApp = new BookTrackerApp();
    });
} else {
    console.log("DOM déjà chargé, initialisation immédiate");
    window.bookTrackerApp = new BookTrackerApp();
}