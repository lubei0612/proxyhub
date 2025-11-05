import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * 获取用户订单列表
   */
  @Get()
  async getUserOrders(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const filters = { status, type };
    return this.orderService.getUserOrders(user.id, page, limit, filters);
  }

  /**
   * 获取订单详情
   */
  @Get(':id')
  async getOrderDetail(
    @CurrentUser() user: any,
    @Param('id') orderId: string,
  ) {
    return this.orderService.getOrderDetail(orderId, user.id);
  }

  /**
   * 获取所有订单（管理员）
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllOrders(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    const filters = { status, type };
    return this.orderService.getAllOrders(page, limit, filters);
  }

  /**
   * 取消订单（管理员）
   */
  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async cancelOrder(@Param('id') orderId: string) {
    return this.orderService.cancelOrder(parseInt(orderId));
  }
}

