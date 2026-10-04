CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"pet_id" integer NOT NULL,
	"requester_id" integer NOT NULL,
	"kind" text DEFAULT 'meet-greet' NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"notes" text,
	"status" text DEFAULT 'requested' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "kind" text DEFAULT 'long-term' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_code" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sale_pct" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointments_pet_idx" ON "appointments" USING btree ("pet_id");--> statement-breakpoint
CREATE INDEX "appointments_requester_idx" ON "appointments" USING btree ("requester_id");