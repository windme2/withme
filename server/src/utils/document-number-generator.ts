// Utility function to generate sequential document numbers
import { PrismaClient } from '../../generated/client/client';

export class DocumentNumberGenerator {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    /**
     * Generate sequential PR number: PR-YYYY-NNNN
     */
    async generatePRNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `PR-${year}-`;

        // Find the last PR number for this year
        const lastPR = await this.prisma.purchase_requisitions.findFirst({
            where: {
                pr_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                pr_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastPR) {
            const lastNumberStr = lastPR.pr_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate sequential GRN number: GRN-YYYY-NNNN
     */
    async generateGRNNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `GRN-${year}-`;

        const lastGRN = await this.prisma.goods_received.findFirst({
            where: {
                grn_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                grn_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastGRN) {
            const lastNumberStr = lastGRN.grn_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate sequential Adjustment number: ADJ-YYYY-NNNN
     */
    async generateAdjustmentNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `ADJ-${year}-`;

        const lastAdj = await this.prisma.inventory_adjustments.findFirst({
            where: {
                adjustment_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                adjustment_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastAdj) {
            const lastNumberStr = lastAdj.adjustment_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate sequential Shipment number: SHIP-YYYY-NNNN
     */
    async generateShipmentNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `SH-${year}-`;

        const lastShip = await this.prisma.sales_shipments.findFirst({
            where: {
                shipment_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                shipment_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastShip) {
            const lastNumberStr = lastShip.shipment_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate sequential Sales Order number: SO-YYYY-NNNN
     */
    async generateSONumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `SO-${year}-`;

        const lastSO = await this.prisma.sales_orders.findFirst({
            where: {
                so_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                so_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastSO) {
            const lastNumberStr = lastSO.so_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate sequential Return number: RET-YYYY-NNNN
     */
    async generateReturnNumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `RET-${year}-`;

        const lastRet = await this.prisma.sales_returns.findFirst({
            where: {
                return_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                return_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastRet) {
            const lastNumberStr = lastRet.return_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    /**
     * Generate sequential PO number: PO-YYYY-NNNN
     */
    async generatePONumber(): Promise<string> {
        const year = new Date().getFullYear();
        const prefix = `PO-${year}-`;

        const lastPO = await this.prisma.purchase_orders.findFirst({
            where: {
                po_number: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                po_number: 'desc',
            },
        });

        let nextNumber = 1;
        if (lastPO) {
            const lastNumberStr = lastPO.po_number.replace(prefix, '');
            const lastNumber = parseInt(lastNumberStr, 10);
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }
}
