import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";

describe("AppController", () => {
  it("health returns ok", async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();
    const controller = module.get(AppController);
    expect(controller.health()).toEqual({ status: "ok" });
  });
});
