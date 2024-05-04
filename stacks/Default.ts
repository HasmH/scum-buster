import { StackContext, RDS, Script, NextjsSite, Api } from "sst/constructs";

export function Default({ stack }: StackContext) {
  const rds = new RDS(stack, "db", {
    engine: "postgresql13.9",
    defaultDatabaseName: "app_database",
  });

  const site = new NextjsSite(stack, "site", {
    bind: [rds],
    path: "packages/web",
  });

  new Script(stack, "migrations", {
    defaults: {
      function: {
        bind: [rds],
        timeout: 300,
        copyFiles: [
          {
            from: "packages/web/migrations",
            to: "migrations",
          },
        ],
      },
    },
    onCreate: "packages/functions/src/migrate.handler",
    onUpdate: "packages/functions/src/migrate.handler",
  });

  const api = new Api(stack, "api", {
    routes: {
      "GET /user/{steamids}": "packages/functions/src/get.handler",
      "POST /downvote/{steamid}": "packages/functions/src/downvote.handler",
    },
  });

  api.bind([rds]);

  stack.addOutputs({
    SiteUrl: site.url,
    RDS_ARN: rds.clusterArn,
    RDS_SECRET: rds.secretArn,
    RDS_DATABASE: rds.defaultDatabaseName,
  });
}
