import { Controller, Get, Query } from "@nestjs/common";
import { SearchService } from "./search.service.js";

@Controller("api/search")
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  searchAll(@Query() query: Record<string, unknown>) {
    return this.search.search(query);
  }

  @Get("suggestions")
  suggestions(@Query("q") q = "", @Query("limit") rawLimit = "6") {
    return this.search.suggestions(q, Number(rawLimit));
  }
}
