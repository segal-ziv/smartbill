"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Starting seed...");
    const user = await prisma.user.upsert({
        where: { email: "demo@smartbill.com" },
        update: {},
        create: {
            email: "demo@smartbill.com",
            clerkId: "demo_clerk_id_123",
            businessName: "SmartBill Demo Business",
        },
    });
    console.log(`Created user: ${user.email}`);
    const suppliers = await Promise.all([
        prisma.supplier.upsert({
            where: { id: "supplier-1" },
            update: {},
            create: {
                id: "supplier-1",
                userId: user.id,
                name: "Amazon Web Services",
                taxId: "123456789",
                email: "billing@aws.amazon.com",
                emailDomains: ["aws.amazon.com", "amazon.com"],
                keywords: ["AWS", "Amazon", "Cloud"],
                totalDocuments: 0,
                totalAmount: 0,
            },
        }),
        prisma.supplier.upsert({
            where: { id: "supplier-2" },
            update: {},
            create: {
                id: "supplier-2",
                userId: user.id,
                name: "Microsoft Azure",
                taxId: "987654321",
                email: "billing@microsoft.com",
                emailDomains: ["microsoft.com", "azure.com"],
                keywords: ["Microsoft", "Azure", "Cloud"],
                totalDocuments: 0,
                totalAmount: 0,
            },
        }),
        prisma.supplier.upsert({
            where: { id: "supplier-3" },
            update: {},
            create: {
                id: "supplier-3",
                userId: user.id,
                name: "ספקים ישראליים בע״מ",
                taxId: "514123456",
                email: "office@supplier.co.il",
                phone: "03-1234567",
                address: "רחוב הנביאים 15, תל אביב",
                emailDomains: ["supplier.co.il"],
                keywords: ["ספקים"],
                totalDocuments: 0,
                totalAmount: 0,
            },
        }),
    ]);
    console.log(`Created ${suppliers.length} suppliers`);
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: "category-1" },
            update: {},
            create: {
                id: "category-1",
                userId: user.id,
                name: "Cloud Services",
                color: "#3B82F6",
                icon: "☁️",
                keywords: ["cloud", "hosting", "server", "infrastructure"],
                totalDocuments: 0,
            },
        }),
        prisma.category.upsert({
            where: { id: "category-2" },
            update: {},
            create: {
                id: "category-2",
                userId: user.id,
                name: "Office Supplies",
                color: "#10B981",
                icon: "📎",
                keywords: ["office", "supplies", "stationery"],
                totalDocuments: 0,
            },
        }),
        prisma.category.upsert({
            where: { id: "category-3" },
            update: {},
            create: {
                id: "category-3",
                userId: user.id,
                name: "Software Licenses",
                color: "#F59E0B",
                icon: "💻",
                keywords: ["software", "license", "subscription"],
                totalDocuments: 0,
            },
        }),
        prisma.category.upsert({
            where: { id: "category-4" },
            update: {},
            create: {
                id: "category-4",
                userId: user.id,
                name: "שירותים מקצועיים",
                color: "#8B5CF6",
                icon: "🔧",
                keywords: ["שירותים", "ייעוץ", "מקצועי"],
                totalDocuments: 0,
            },
        }),
    ]);
    console.log(`Created ${categories.length} categories`);
    const documents = await Promise.all([
        prisma.document.upsert({
            where: { id: "doc-1" },
            update: {},
            create: {
                id: "doc-1",
                userId: user.id,
                supplierId: suppliers[0].id,
                categoryId: categories[0].id,
                invoiceNumber: "AWS-2024-001",
                issueDate: new Date("2024-01-15"),
                dueDate: new Date("2024-02-15"),
                totalAmount: 1250.00,
                vatAmount: 212.50,
                currency: "ILS",
                fileUrl: "demo/aws-invoice.pdf",
                fileType: "pdf",
                fileName: "aws-invoice-jan-2024.pdf",
                fileSize: 245678,
                source: "GMAIL",
                sourceMetadata: {
                    from: "billing@aws.amazon.com",
                    subject: "Your AWS Invoice for January 2024",
                },
                status: "APPROVED",
                ocrStatus: "COMPLETED",
                ocrConfidence: 0.95,
                ocrData: {
                    supplier: { name: "Amazon Web Services", confidence: 0.98 },
                    invoiceNumber: "AWS-2024-001",
                    totalAmount: 1250,
                    vatAmount: 212.50,
                },
                tags: ["cloud", "monthly"],
                notes: "January cloud infrastructure costs",
            },
        }),
        prisma.document.upsert({
            where: { id: "doc-2" },
            update: {},
            create: {
                id: "doc-2",
                userId: user.id,
                supplierId: suppliers[1].id,
                categoryId: categories[0].id,
                invoiceNumber: "AZURE-2024-002",
                issueDate: new Date("2024-01-20"),
                totalAmount: 890.00,
                vatAmount: 151.30,
                currency: "ILS",
                fileUrl: "demo/azure-invoice.pdf",
                fileType: "pdf",
                fileName: "azure-invoice-jan-2024.pdf",
                fileSize: 189234,
                source: "MANUAL",
                status: "PENDING",
                ocrStatus: "PROCESSING",
                tags: ["cloud"],
            },
        }),
        prisma.document.upsert({
            where: { id: "doc-3" },
            update: {},
            create: {
                id: "doc-3",
                userId: user.id,
                supplierId: suppliers[2].id,
                categoryId: categories[3].id,
                invoiceNumber: "IL-2024-123",
                issueDate: new Date("2024-02-01"),
                totalAmount: 5670.00,
                vatAmount: 963.90,
                currency: "ILS",
                fileUrl: "demo/israeli-supplier.pdf",
                fileType: "pdf",
                fileName: "חשבונית-פברואר-2024.pdf",
                fileSize: 312456,
                source: "IMAP",
                status: "APPROVED",
                ocrStatus: "COMPLETED",
                ocrConfidence: 0.88,
                tags: ["שירותים", "חודשי"],
                notes: "שירותי ייעוץ לחודש פברואר",
            },
        }),
    ]);
    console.log(`Created ${documents.length} documents`);
    await prisma.businessSettings.upsert({
        where: { userId: user.id },
        update: {},
        create: {
            userId: user.id,
            businessName: "SmartBill Demo Business",
            taxId: "514987654",
            address: "רחוב הרצל 10, תל אביב",
            gmailEnabled: false,
            imapEnabled: false,
            whatsappEnabled: false,
            inboundEmailEnabled: false,
            ocrProvider: "GOOGLE_VISION",
            ocrAutoProcess: true,
            defaultExportFormat: "excel",
            includeAttachments: true,
        },
    });
    console.log("Created business settings");
    for (const supplier of suppliers) {
        const stats = await prisma.document.aggregate({
            where: { supplierId: supplier.id },
            _count: { id: true },
            _sum: { totalAmount: true },
        });
        await prisma.supplier.update({
            where: { id: supplier.id },
            data: {
                totalDocuments: stats._count.id,
                totalAmount: stats._sum.totalAmount || 0,
            },
        });
    }
    for (const category of categories) {
        const count = await prisma.document.count({
            where: { categoryId: category.id },
        });
        await prisma.category.update({
            where: { id: category.id },
            data: { totalDocuments: count },
        });
    }
    console.log("Updated stats");
    console.log("Seed completed successfully!");
}
main()
    .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map