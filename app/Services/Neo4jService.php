<?php

namespace App\Services;

use Laudis\Neo4j\ClientBuilder;
use Laudis\Neo4j\Databags\SessionConfiguration;
use Laudis\Neo4j\Exceptions\Neo4jException;
use Illuminate\Support\Facades\Log;
use Laudis\Neo4j\Authentication\Authenticate;


/**
 * Service wrapper for Neo4j Aura connections.
 *
 * It reads the connection parameters from the .env file:
 *   NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE
 *
 * The `run` method receives a Cypher query and an optional array of parameters
 * and returns the raw result from the client (or throws an exception).
 */
class Neo4jService
{
    /** @var \Laudis\Neo4j\Client */
    protected $client;

    public function __construct()
    {
        $uri      = env('NEO4J_URI', 'bolt://neo4j:7687');
        $user     = env('NEO4J_USERNAME', 'neo4j');
        $pass     = env('NEO4J_PASSWORD', 'secret1234');
        $database = env('NEO4J_DATABASE', 'neo4j');

        $builder = ClientBuilder::create()
            ->withDriver('default', $uri, Authenticate::basic($user, $pass));

        if ($database) {
            $builder = $builder->withDefaultSessionConfiguration(SessionConfiguration::create($database));
        }

        $this->client = $builder->build();
    }

    /**
     * Execute a Cypher query.
     *
     * @param string $query  Cypher statement
     * @param array  $params Optional parameters for the query
     * @return mixed          Result object from the driver
     * @throws Neo4jException When the query cannot be executed
     */
    public function run(string $query, array $params = [])
    {
        return $this->client->run($query, $params);
    }
}
