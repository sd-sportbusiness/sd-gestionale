/*
  # Add Sale Cancellation Support

  1. Changes to `sales` table
    - `status` (text) - Sale status: 'completed' or 'cancelled'. Default: 'completed'
    - `cancelled_at` (timestamptz) - When the sale was cancelled
    - `cancellation_reason` (text) - Reason for cancellation
    - `cancellation_notes` (text) - Additional notes about cancellation
    - `refund_issued` (boolean) - Whether a refund document was issued. Default: false
    - `refund_number` (integer) - Sequential refund number

  2. New sequence
    - `refund_number_seq` for generating sequential refund numbers

  3. Indexes
    - `idx_sales_status` on sales(status) for filtering by status
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'status'
  ) THEN
    ALTER TABLE sales ADD COLUMN status text NOT NULL DEFAULT 'completed';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'cancelled_at'
  ) THEN
    ALTER TABLE sales ADD COLUMN cancelled_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE sales ADD COLUMN cancellation_reason text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'cancellation_notes'
  ) THEN
    ALTER TABLE sales ADD COLUMN cancellation_notes text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'refund_issued'
  ) THEN
    ALTER TABLE sales ADD COLUMN refund_issued boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'refund_number'
  ) THEN
    ALTER TABLE sales ADD COLUMN refund_number integer;
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS refund_number_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);