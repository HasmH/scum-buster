ALTER TABLE "users" RENAME COLUMN "id" TO "steam_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "full_name" TO "persona_name";--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("steam_id");--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "steam_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_url" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "downvotes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "created_at" bigint;