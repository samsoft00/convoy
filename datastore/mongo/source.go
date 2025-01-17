package mongo

import (
	"context"
	"errors"
	"time"

	"github.com/frain-dev/convoy/datastore"
	"github.com/frain-dev/convoy/util"
	pager "github.com/gobeam/mongo-go-pagination"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type sourceRepo struct {
	innerDB *mongo.Database
	client  *mongo.Collection
	store   datastore.Store
}

func NewSourceRepo(db *mongo.Database, store datastore.Store) datastore.SourceRepository {
	return &sourceRepo{
		innerDB: db,
		client:  db.Collection(SourceCollection),
		store:   store,
	}
}

func (s *sourceRepo) CreateSource(ctx context.Context, source *datastore.Source) error {
	source.ID = primitive.NewObjectID()

	err := s.store.Save(ctx, source, nil)
	return err
}

func (s *sourceRepo) UpdateSource(ctx context.Context, groupId string, source *datastore.Source) error {
	filter := bson.M{"uid": source.UID, "group_id": groupId, "document_status": datastore.ActiveDocumentStatus}

	update := bson.D{
		primitive.E{Key: "name", Value: source.Name},
		primitive.E{Key: "type", Value: source.Type},
		primitive.E{Key: "is_disabled", Value: source.IsDisabled},
		primitive.E{Key: "verifier", Value: source.Verifier},
		primitive.E{Key: "updated_at", Value: primitive.NewDateTimeFromTime(time.Now())},
	}

	err := s.store.UpdateOne(ctx, filter, update)
	return err
}

func (s *sourceRepo) FindSourceByID(ctx context.Context, groupId string, id string) (*datastore.Source, error) {
	source := &datastore.Source{}

	filter := bson.M{"uid": id, "group_id": groupId}

	err := s.store.FindOne(ctx, filter, nil, source)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return source, datastore.ErrSourceNotFound
	}

	return source, err
}

func (s *sourceRepo) FindSourceByMaskID(ctx context.Context, maskId string) (*datastore.Source, error) {
	source := &datastore.Source{}

	filter := bson.M{"mask_id": maskId}

	err := s.store.FindOne(ctx, filter, nil, source)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return source, datastore.ErrSourceNotFound
	}

	return source, nil
}

func (s *sourceRepo) DeleteSourceByID(ctx context.Context, groupId string, id string) error {
	filter := bson.M{"uid": id, "group_id": groupId}

	update := bson.M{
		"deleted_at":      primitive.NewDateTimeFromTime(time.Now()),
		"document_status": datastore.DeletedDocumentStatus,
	}

	err := s.store.UpdateOne(ctx, filter, update)
	return err
}

func (s *sourceRepo) LoadSourcesPaged(ctx context.Context, groupID string, f *datastore.SourceFilter, pageable datastore.Pageable) ([]datastore.Source, datastore.PaginationData, error) {
	var sources []datastore.Source

	filter := bson.M{"group_id": groupID, "document_status": datastore.ActiveDocumentStatus}

	if !util.IsStringEmpty(f.Type) {
		filter = bson.M{"group_id": groupID, "document_status": datastore.ActiveDocumentStatus, "type": f.Type}
	}

	paginatedData, err := pager.New(s.client).Context(ctx).Limit(int64(pageable.PerPage)).Page(int64(pageable.Page)).Sort("created_at", -1).Filter(filter).Decode(&sources).Find()
	if err != nil {
		return sources, datastore.PaginationData{}, err
	}

	if sources == nil {
		sources = make([]datastore.Source, 0)
	}

	return sources, datastore.PaginationData(paginatedData.Pagination), nil
}
