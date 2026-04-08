-- Optional: create a minimal checkpoints table and seed rows for local testing
-- (e.g. Supabase SQL editor). Adjust JSON to match your app.

CREATE TABLE IF NOT EXISTS checkpoints (
  thread_id TEXT NOT NULL,
  checkpoint_ns TEXT NOT NULL DEFAULT '',
  checkpoint_id TEXT NOT NULL,
  parent_checkpoint_id TEXT,
  checkpoint JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
);

INSERT INTO checkpoints VALUES
  ('thread-1', '', 'cp-001', null,
   '{"v": 1, "channel_values": {"user_query": "hello world", "status": "pending"}}',
   '{}'),
  ('thread-1', '', 'cp-002', 'cp-001',
   '{"v": 1, "channel_values": {"user_query": "second message", "messages": []}}',
   '{}'),
  ('thread-2', '', 'cp-001', null,
   '{"v": 1, "channel_values": {"user_query": "different thread", "status": "done"}}',
   '{}');
