-- Add faq and consultation to conversation_states flow types
ALTER TABLE conversation_states DROP CONSTRAINT conversation_states_current_flow_check;
ALTER TABLE conversation_states ADD CONSTRAINT conversation_states_current_flow_check
  CHECK (current_flow IN ('idle', 'skin_diagnosis', 'health_diagnosis', 'meal_analysis', 'daily_report', 'reservation', 'faq', 'consultation'));
