#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
enum DataKey {
    Messages,
}

#[contract]
pub struct MessageBoard;

#[contractimpl]
impl MessageBoard {
    pub fn write_message(env: Env, msg: String) {
        let mut messages: Vec<String> = env
            .storage()
            .persistent()
            .get(&DataKey::Messages)
            .unwrap_or_else(|| Vec::new(&env));
        messages.push_back(msg);
        env.storage().persistent().set(&DataKey::Messages, &messages);
    }

    pub fn get_messages(env: Env) -> Vec<String> {
        env.storage()
            .persistent()
            .get(&DataKey::Messages)
            .unwrap_or_else(|| Vec::new(&env))
    }

    pub fn get_message_count(env: Env) -> u32 {
        let messages = Self::get_messages(env);
        messages.len() as u32
    }

    pub fn clear_messages(env: Env) {
        // TODO: Implement admin authentication.
        env.storage().persistent().remove(&DataKey::Messages);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn writes_and_reads_messages() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, MessageBoard);
        let client = MessageBoardClient::new(&env, &contract_id);

        client.write_message(&String::from_slice(&env, "Hello"));
        client.write_message(&String::from_slice(&env, "Soroban"));

        let messages = client.get_messages();
        assert_eq!(messages.len(), 2);
        assert_eq!(messages.get(0).unwrap(), String::from_slice(&env, "Hello"));
        assert_eq!(messages.get(1).unwrap(), String::from_slice(&env, "Soroban"));
        assert_eq!(client.get_message_count(), 2);

        client.clear_messages();
        assert_eq!(client.get_message_count(), 0);
    }
}
