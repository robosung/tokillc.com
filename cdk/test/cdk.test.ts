import { Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as customContext from "../bin/custom-context.json";
import { WebsiteStack } from "../lib/www-site-stack";
import { normalizeTemplate } from "@teamexos/infra-template-normalize";

const accountId = process.env.AWS_ACCT_ID ?? "482638059955";
const region = process.env.AWS_REGION ?? "us-east-1";
const accountConfig = customContext[accountId as keyof typeof customContext];

const corpAccountId = "192231937478";
describe("FontsWebsiteStack", () => {
  test("Snapshot Test", () => {
    const stack = new Stack();

    const env = {
      account: corpAccountId,
      region: region,
    };
    const fontwebsiteStack = new WebsiteStack(
      stack,
      "fontwebsiteStack",
      { env: env },
      "dev"
    );
    const template = Template.fromStack(fontwebsiteStack);
    const normalizedTemplate = normalizeTemplate(template);
    expect(normalizedTemplate).toMatchSnapshot();
  });
});
