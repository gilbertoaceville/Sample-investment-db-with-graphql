const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    # UserDetail and information 

    type BankingDetails { 
        bank_name: String
        bank_account_number: String
        bank_account_name: String
    }

    type UserModel {
        _id: ID
        token: String
        email: String!
        phone: String!
        full_name: String!
        banking_details: BankingDetails
    }

    type Investment{
        _id: ID
        investor: ID
        date: String!
        due_date: String!
        amount: String!
        is_settled: Boolean!
        ref: String
        payout_amount: String!
    }

    type RootMutation {
        #///////////////
        #register_user
            register_user(
                bank_name: String!,
                 bank_account_number: String!,
                  bank_account_name: String!, 
                  email: String!, phone: String!, 
                  full_name: String!, 
                  password: String!
                  phone: String!
            ): UserModel!


            #//////////
            #next mutation
        login_user (email: String!, password: String!) : UserModel!


        #////////////////////
        #change user password 
        change_password(current_password: String!, new_password:String!): String!

        #//////////////////
        #send otp
        send_otp(email: String!): String!

        #///////////////
        #//////////////
        #investment 

        create_investment(amount: String!, ref: String!): Investment!
        settle_investment: String!

        
    }

    type RootQuery {
        #//////////////////
        #verify otp
        verify_otp(code: String!, email: String!): String!



        #////investment
        get_investment_by_id(_id: ID): Investment!
        get_all_investment(email: String): [Investment!]!
        get_next_invest: Int!
    }


    schema{
        query: RootQuery
        mutation: RootMutation
    }

`);