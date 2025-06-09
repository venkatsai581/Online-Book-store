const fs = require('fs');
const PDFDocument = require('pdfkit');

// Create a new PDF document
const doc = new PDFDocument();
const output = fs.createWriteStream('output.pdf');

// Pipe the PDF into a file
doc.pipe(output);

// Read db.json
const data = JSON.parse(fs.readFileSync('database/db.json', 'utf8'));

// Add title
doc.fontSize(20).text('Bookstore Data Report', { align: 'center' });
doc.moveDown();

// Users Section
doc.fontSize(16).text('Users', { underline: true });
doc.moveDown(0.5);
if (data.users.length === 0) {
    doc.fontSize(12).text('No users found.');
} else {
    data.users.forEach(user => {
        doc.fontSize(12).text(`ID: ${user.id}`);
        doc.text(`Username: ${user.username}`);
        doc.text(`Email: ${user.email}`);
        doc.moveDown();
    });
}

// Profiles Section
doc.fontSize(16).text('Profiles', { underline: true });
doc.moveDown(0.5);
if (data.profiles.length === 0) {
    doc.fontSize(12).text('No profiles found.');
} else {
    data.profiles.forEach(profile => {
        doc.fontSize(12).text(`User ID: ${profile.userId}`);
        doc.text(`Full Name: ${profile.fullName || 'Not provided'}`);
        doc.text(`Address: ${profile.address || 'Not provided'}`);
        doc.text(`Phone: ${profile.phone || 'Not provided'}`);
        doc.moveDown();
    });
}

// Orders Section
doc.fontSize(16).text('Orders', { underline: true });
doc.moveDown(0.5);
if (data.orders.length === 0) {
    doc.fontSize(12).text('No orders found.');
} else {
    data.orders.forEach(order => {
        doc.fontSize(12).text(`Order ID: ${order.id}`);
        doc.text(`User ID: ${order.userId}`);
        doc.text(`Username: ${order.username}`);
        doc.text(`Total: $${(Math.round(order.total * 100) / 100).toFixed(2)}`);
        doc.text(`Date: ${new Date(order.date).toLocaleString()}`);
        doc.text('Items:');
        order.items.forEach(item => {
            doc.text(`  - ${item.title} ($${item.price.toFixed(2)} x ${item.quantity})`);
        });
        doc.moveDown();
    });
}

// Finalize the PDF
doc.end();

console.log('PDF generated: output.pdf');