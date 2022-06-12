//go:build integration
// +build integration

package mongo

import (
	"context"
	"fmt"
	"github.com/frain-dev/convoy/auth"
	"testing"
	"time"

	"github.com/frain-dev/convoy/datastore"
	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestLoadOrganisationsInvitesPaged(t *testing.T) {
	db, closeFn := getDB(t)
	defer closeFn()

	inviteRepo := NewOrgInviteRepo(db)
	org := &datastore.Organisation{
		UID:            uuid.NewString(),
		Name:           "test_org",
		DocumentStatus: datastore.ActiveDocumentStatus,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err := NewOrgRepo(db).CreateOrganisation(context.Background(), org)
	require.NoError(t, err)

	uids := []string{}
	for i := 1; i < 3; i++ {
		iv := &datastore.OrganisationInvite{
			UID:            uuid.NewString(),
			InviteeEmail:   fmt.Sprintf("%s@gmail.com", uuid.NewString()),
			Token:          uuid.NewString(),
			OrganisationID: org.UID,
			Role:           auth.Role{Type: auth.RoleAdmin},
			Status:         datastore.InviteStatusPending,
			DocumentStatus: datastore.ActiveDocumentStatus,
			CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
			UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		}
		uids = append(uids, iv.UID)
		err := inviteRepo.CreateOrganisationInvite(context.Background(), iv)
		require.NoError(t, err)
	}

	for i := 1; i < 3; i++ {
		iv := &datastore.OrganisationInvite{
			UID:            uuid.NewString(),
			InviteeEmail:   fmt.Sprintf("%s@gmail.com", uuid.NewString()),
			Token:          uuid.NewString(),
			OrganisationID: org.UID,
			Role:           auth.Role{Type: auth.RoleAdmin},
			Status:         datastore.InviteStatusDeclined,
			DocumentStatus: datastore.ActiveDocumentStatus,
			CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
			UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		}

		err := inviteRepo.CreateOrganisationInvite(context.Background(), iv)
		require.NoError(t, err)
	}

	organisationInvites, _, err := inviteRepo.LoadOrganisationsInvitesPaged(context.Background(), org.UID, datastore.InviteStatusPending, datastore.Pageable{
		Page:    1,
		PerPage: 100,
		Sort:    -1,
	})

	require.NoError(t, err)
	require.Equal(t, 2, len(organisationInvites))
	for _, invite := range organisationInvites {
		require.Contains(t, uids, invite.UID)
	}
}

func TestCreateOrganisationInvite(t *testing.T) {
	db, closeFn := getDB(t)
	defer closeFn()

	inviteRepo := NewOrgInviteRepo(db)

	iv := &datastore.OrganisationInvite{
		UID:            uuid.NewString(),
		InviteeEmail:   fmt.Sprintf("%s@gmail.com", uuid.NewString()),
		Token:          uuid.NewString(),
		Role:           auth.Role{Type: auth.RoleAdmin},
		Status:         datastore.InviteStatusPending,
		DocumentStatus: datastore.ActiveDocumentStatus,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err := inviteRepo.CreateOrganisationInvite(context.Background(), iv)
	require.NoError(t, err)

	invite, err := inviteRepo.FetchOrganisationInviteByID(context.Background(), iv.UID)
	require.NoError(t, err)

	require.Equal(t, iv.UID, invite.UID)
	require.Equal(t, iv.Token, invite.Token)
}

func TestUpdateOrganisationInvite(t *testing.T) {
	db, closeFn := getDB(t)
	defer closeFn()

	inviteRepo := NewOrgInviteRepo(db)

	iv := &datastore.OrganisationInvite{
		UID:          uuid.NewString(),
		InviteeEmail: fmt.Sprintf("%s@gmail.com", uuid.NewString()),
		Token:        uuid.NewString(),
		Role: auth.Role{
			Type:   auth.RoleAdmin,
			Groups: []string{uuid.NewString()},
		},
		Status:         datastore.InviteStatusPending,
		DocumentStatus: datastore.ActiveDocumentStatus,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err := inviteRepo.CreateOrganisationInvite(context.Background(), iv)
	require.NoError(t, err)

	role := auth.Role{
		Type:   auth.RoleSuperUser,
		Groups: []string{uuid.NewString()},
		Apps:   nil,
	}
	iv.Role = role

	err = inviteRepo.UpdateOrganisationInvite(context.Background(), iv)
	require.NoError(t, err)

	invite, err := inviteRepo.FetchOrganisationInviteByID(context.Background(), iv.UID)
	require.NoError(t, err)

	require.Equal(t, invite.Role, role)
	require.Equal(t, invite.UID, iv.UID)
}

func TestDeleteOrganisationInvite(t *testing.T) {
	db, closeFn := getDB(t)
	defer closeFn()

	inviteRepo := NewOrgInviteRepo(db)

	org := &datastore.OrganisationInvite{
		UID:          uuid.NewString(),
		InviteeEmail: fmt.Sprintf("%s@gmail.com", uuid.NewString()),
		Token:        uuid.NewString(),
		Role: auth.Role{
			Type:   auth.RoleAdmin,
			Groups: []string{uuid.NewString()},
		},
		Status:         datastore.InviteStatusPending,
		DocumentStatus: datastore.ActiveDocumentStatus,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err := inviteRepo.CreateOrganisationInvite(context.Background(), org)
	require.NoError(t, err)

	err = inviteRepo.DeleteOrganisationInvite(context.Background(), org.UID)
	require.NoError(t, err)

	_, err = inviteRepo.FetchOrganisationInviteByID(context.Background(), org.UID)
	require.Equal(t, datastore.ErrOrgInviteNotFound, err)
}

func TestFetchOrganisationInviteByID(t *testing.T) {
	db, closeFn := getDB(t)
	defer closeFn()

	inviteRepo := NewOrgInviteRepo(db)
	iv := &datastore.OrganisationInvite{
		UID:          uuid.NewString(),
		InviteeEmail: fmt.Sprintf("%s@gmail.com", uuid.NewString()),
		Token:        uuid.NewString(),
		Role: auth.Role{
			Type:   auth.RoleAdmin,
			Groups: []string{uuid.NewString()},
		},
		Status:         datastore.InviteStatusPending,
		DocumentStatus: datastore.ActiveDocumentStatus,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err := inviteRepo.CreateOrganisationInvite(context.Background(), iv)
	require.NoError(t, err)

	invite, err := inviteRepo.FetchOrganisationInviteByID(context.Background(), iv.UID)
	require.NoError(t, err)

	require.Equal(t, iv.UID, invite.UID)
	require.Equal(t, iv.Token, invite.Token)
	require.Equal(t, iv.InviteeEmail, invite.InviteeEmail)
}

func TestFetchOrganisationInviteByTokenAndEmail(t *testing.T) {
	db, closeFn := getDB(t)
	defer closeFn()

	inviteRepo := NewOrgInviteRepo(db)
	iv := &datastore.OrganisationInvite{
		UID:          uuid.NewString(),
		InviteeEmail: fmt.Sprintf("%s@gmail.com", uuid.NewString()),
		Token:        uuid.NewString(),
		Role: auth.Role{
			Type:   auth.RoleAdmin,
			Groups: []string{uuid.NewString()},
		},
		Status:         datastore.InviteStatusPending,
		DocumentStatus: datastore.ActiveDocumentStatus,
		CreatedAt:      primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:      primitive.NewDateTimeFromTime(time.Now()),
	}

	err := inviteRepo.CreateOrganisationInvite(context.Background(), iv)
	require.NoError(t, err)

	invite, err := inviteRepo.FetchOrganisationInviteByToken(context.Background(), iv.Token)
	require.NoError(t, err)

	require.Equal(t, iv.UID, invite.UID)
	require.Equal(t, iv.Token, invite.Token)
	require.Equal(t, iv.InviteeEmail, invite.InviteeEmail)
}
