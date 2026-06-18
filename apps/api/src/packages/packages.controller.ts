import { Controller, Get } from '@nestjs/common';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Get('plans')
  listPlans(): [] {
    return this.packages.listPlans();
  }

  @Get('admin/plans')
  listPlansAdmin(): [] {
    return this.packages.listPlansAdmin();
  }

  @Get('admin/categories')
  listCategoryNamesAdmin(): [] {
    return this.packages.listCategoryNamesAdmin();
  }

  @Get('me')
  mine(): [] {
    return this.packages.listMine();
  }
}
