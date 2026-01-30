import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('stats')
    @Roles('admin', 'inventory', 'purchasing', 'sales')
    getStats() {
        return this.dashboardService.getStats();
    }

    @Get('transactions')
    @Roles('admin', 'inventory', 'purchasing', 'sales')
    getRecentTransactions() {
        return this.dashboardService.getRecentTransactions();
    }

    @Get('low-stock')
    @Roles('admin', 'inventory', 'purchasing')
    getLowStockItems() {
        return this.dashboardService.getLowStockItems();
    }
}
