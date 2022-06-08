//go:build integration
// +build integration

package mongo

import (
	"context"
	"testing"

	"github.com/frain-dev/convoy/config"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/mongo"
)

func getDSN() string {
	return "mongodb://localhost:27017/convoyxx"
}

func getConfig() config.Configuration {

	return config.Configuration{
		Database: config.DatabaseConfiguration{
			Type: config.MongodbDatabaseProvider,
			Dsn:  getDSN(),
		},
	}
}

func getDB(t *testing.T) (*mongo.Database, func()) {

	db, err := New(getConfig())
	require.NoError(t, err)

	client := db.Client().(*mongo.Database)

	return client, func() {
		require.NoError(t, client.Drop(context.TODO()))
		require.NoError(t, db.Disconnect(context.Background()))
	}
}
